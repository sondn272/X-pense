const { ApolloServer, gql } = require('apollo-server');
const dotenv = require('dotenv');
const { MongoClient, ObjectID } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const lodash = require('lodash');
const { formatError } = require('graphql');

dotenv.config();

const { DB_URI, DB_NAME, JWT_SECRET } = process.env;

const getToken = user => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30 days' })
const getUserFromToken = async (token, db) => {
    if (!token) {
        return null
    }

    const tokenData = jwt.verify(token, JWT_SECRET)
    if (!tokenData?.id) {
        return null
    }

    return await db.collection('Users').findOne({ _id: ObjectID(tokenData.id) })
}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
    type Query {
        users: User!

        getTransactions(filter: DateFilter!): [DailyTransactions!]!
        getMonthlyReport(filter: DateFilter!): MonthlyReport
        getCategories: [Categories!]!
    }

    type Mutation {
        signUp(input: SignUpInput): AuthUser!
        signIn(input: SignInInput): AuthUser!

        addNewTransaction(input: AddTransactionInput!): Transaction!
        updateTransaction(input: UpdateTransactionInput!): Transaction!
        deleteTransaction(transaction_id: String!): Boolean!
    }

    input SignUpInput {
        email: String!
        password: String!
        name: String!
        avatar: String
    }

    input SignInInput {
        email: String!
        password: String!
    }

    input AddTransactionInput {
        category_id: ID!
        day: String!
        month: String!
        year: String!
        value: Float!
        currency: String!
        note: String
    }

    input UpdateTransactionInput {
        transaction_id: ID!
        category_id: ID
        day: String
        month: String
        year: String
        value: Float
        currency: String
        note: String
    }

    input DateFilter {
        day: String
        month: String!
        year: String!
    }

    type Date {
        day: String!
        month: String!
        year: String!
    }

    type AuthUser {
        user: User!
        token: String!
    }

    type User {
        user_id: ID!
        name: String!
        email: String!
        avatar: String
    }

    type Transaction {
        transaction_id: ID!
        user_id: ID!
        category: Category!
        date: Date!
        amount: Amount!
        note: String
    }

    type DailyTransactions {
        date: Date!
        amount: Amount!
        transactions: [Transaction!]
    }

    type Amount {
        value: Float!
        currency: String!
    }

    type Category {
        category_id: ID!
        category_name: String!
        title: String!
        icon: String!
        icon_color: String!
        background_color: String!
        type: String!
    }

    type Categories {
        type: CategoryType!,
        categories: [Category!]
    }

    enum CategoryType {
        income,
        expense
    }

    type MonthlyReport {
        period: Period
        cash_flow: CashFlow
        balance: Balance
        expense: [CategoriesReport!]
        income: [CategoriesReport!]
    }

    type CategoriesReport {
        category: Category
        amount: Amount
    }

    type Balance {
        start: Amount!
        end: Amount!
        chart_data: [BalanceChartData!]!
    }

    type BalanceChartData {
        label: String!
        value: Float!
    }

    type Period {
        month: String!
        year: String!
    }

    type CashFlow {
        expense: Amount
        income: Amount
    }

    type CategoryData {
        amount: Amount!
        category: Category!
    }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        users: () => [],

        getTransactions: async (_, { filter }, { db, user }) => {
            if(!user) {
                throw new Error ('Authentication Error. Please sign in')
            }

            const { day, month, year } = filter

            const objForQuery = lodash.pickBy({
                user_id: ObjectID(user._id),
                "date.day": day,
                "date.month": month,
                "date.year": year
            }, lodash.identity)

            const result = await db.collection('Transactions').find(objForQuery).toArray()
            
            let _groupedResult
            _groupedResult = result.map(item => {
                return {
                    ...item,
                    fullDate: item.date.day + ' ' + item.date.month + ' ' + item.date.year
                }
            })
            const groupedResult = lodash.groupBy(_groupedResult, 'fullDate')
            Object.keys(groupedResult).reduce((accumulator, currentValue) => {
                accumulator[currentValue] = groupedResult[currentValue];
                return accumulator;
            }, {})
           
            const finalResult = []
            for (var key in groupedResult) {
                const obj = {}
                obj.date = {
                    day: key.split(' ')[0],
                    month: key.split(' ')[1],
                    year: key.split(' ')[2]
                }
                obj.transactions = groupedResult[key]
                obj.amount = {
                    currency: groupedResult[key][0].amount.currency,
                    value: lodash.sumBy(groupedResult[key], "amount.value")
                }
                finalResult.push(obj)
            }
            finalResult.sort((a, b) => b.date.day - a.date.day)
            return Object.assign(finalResult)
        },

        getMonthlyReport: async (_, { filter }, { db, user }) => {
            if(!user) {
                throw new Error ('Authentication Error. Please sign in')
            }

            const { month, year } = filter

            const objForQuery = lodash.pickBy({
                user_id: ObjectID(user._id),
                "date.month": month,
                "date.year": year
            }, lodash.identity)

            const transactions = await db.collection('Transactions').find(objForQuery).toArray()
        
            //calculating cash_flow
            const _cash_flow = lodash.groupBy(transactions, "category.type")
            const cash_flow = lodash.mapValues(_cash_flow, value => {
                                return Object.assign({
                                    currency: value[0].amount.currency, //using only vnd for now
                                    value: lodash.sumBy(value, "amount.value")
                                })
                            })
            
            //calculating expenses and incomes by category
            const _groupedTransactionsByCate = lodash.groupBy(transactions, 'category.category_name')
            const categories = lodash.groupBy(lodash.values(
                lodash.mapValues(_groupedTransactionsByCate, value => {
                    return Object.assign({
                        category: value[0].category,
                        amount: {
                            currency: value[0].amount.currency,
                            value: lodash.sumBy(value, "amount.value")
                        }
                    })
                })
            ), 'category.type')

            console.log(Object.assign({
                cash_flow,
                ...categories
            }))

            return Object.assign({
                cash_flow,
                ...categories
            })
        },

        getCategories: async (_, __, { db }) => {
            const categories = await db.collection('Categories').find().toArray()
            const _groupedCategoriesByType = lodash.groupBy(categories, 'type')
            const groupedCategoriesByType = []
            for (var key in _groupedCategoriesByType) {
                const obj = {}
                obj.type = key
                obj.categories = _groupedCategoriesByType[key]
                groupedCategoriesByType.push(obj)
            }

            return Object.assign(groupedCategoriesByType)
        }
    },
    Mutation: {
        signUp: async (_, { input }, { db }) => {
            const checkExistedUser = await db.collection('Users').findOne({email: input.email});
            if (checkExistedUser) {
                throw new Error ('Email is invalid or already taken')
            }

            const hashedPassword = bcrypt.hashSync(input.password);
            const newUser = {
                ...input,
                password: hashedPassword
            }
            //save to database
            const result = await db.collection('Users').insertOne(newUser)

            const user = result.ops[0]
            return {
                user,
                token: getToken(user),
            }
        },
        signIn: async (_, { input }, { db } ) => {
            const user = await db.collection('Users').findOne({ email: input.email });
            const isPasswordCorrect = user && bcrypt.compareSync(input.password, user.password);

            if (!user || !isPasswordCorrect) {
                throw new Error('Invalid credentials!') 
            }
            return {
                user,
                token: getToken(user),
            }
        },
        addNewTransaction: async (_, { input }, { db, user }) => {
            if(!user) {
                throw new Error ('Authentication Error. Please sign in')
            }
            const category = await db.collection('Categories').findOne({ _id: ObjectID(input.category_id) });
            const { day, month, year, value, currency, note } = input;

            const isInvalid = !day || !month || !year || !value || !currency || !category
            
            if(isInvalid) {
                throw new Error ('Something went wrong. Please try again')
            }

            const transactionInput = {
                date: {
                    day,
                    month,
                    year
                },
                amount: {
                    value,
                    currency
                },
                category,
                note,
                user_id: user.user_id || user._id
            }

            const transaction = await db.collection('Transactions').insertOne(transactionInput)
            return transaction.ops[0]
        },
        updateTransaction: async (_, { input }, { db, user }) => {
            if(!user) {
                throw new Error ('Authentication Error. Please sign in')
            }

            const { transaction_id, category_id, day, month, year, value, currency, note } = input

            const _objForUpdate = {
                "date.day": day,
                "date.month": month,
                "date.year": year,
                "amount.value": value,
                "amount.currency": currency,
                note
            }

            let newCategory;
            if (category_id) {
                newCategory = await db.collection('Categories').findOne({ _id: ObjectID(category_id) })
            }

            const objForUpdate = lodash.pickBy({..._objForUpdate, category: newCategory}, lodash.identity)
            
            const result = await db.collection('Transactions').updateOne({ 
                                                                _id: ObjectID(transaction_id) 
                                                            }, {
                                                                $set: objForUpdate
                                                            })
            return await db.collection('Transactions').findOne({ _id: ObjectID(transaction_id) })
        },
        deleteTransaction: async (_, { transaction_id }, { db, user }) => {
            if(!user) {
                throw new Error ('Authentication Error. Please sign in')
            } 

            await db.collection('Transactions').removeOne({ _id: ObjectID(transaction_id) })

            return true;
        }
    },
    User: {
        user_id: ({ _id, id }) => _id || id
    },
    Transaction: {
        transaction_id: ({ _id, id }) => _id || id
    },
    Category: {
        category_id: ({ _id, id }) => _id || id
    }
};

const start = async () => {
    const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(DB_NAME)

    const context = {
        db,
    }

    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const server = new ApolloServer({ 
        typeDefs, 
        resolvers, 
        context: async ({ req }) => {
            const user = await getUserFromToken(req.headers.authorization, db)
            return {
                db,
                user
            }
        }
    });

    // The `listen` method launches a web server.
    server.listen().then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
}

start();



