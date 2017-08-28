const graphql = require ('graphql');
const User = require('./models/user');
// const TODOs = [
//   {
//       "id": 1446412739542,
//       "title": "Read emails",
//       "completed": false
//   },
//   {
//       "id": 1446412740883,
//       "title": "Buy orange",
//       "completed": true
//   }
// ];

const userType = new graphql.GraphQLObjectType({
  name: 'user',
  fields: () => ({
      _id: {type: graphql.GraphQLString},
      name: {type: graphql.GraphQLString},
      email: {type: graphql.GraphQLString},
      username: {type: graphql.GraphQLString},
      password: {type: graphql.GraphQLString},
      msg: {type: graphql.GraphQLString}
  })
});

const queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields:{
      users: {
        type: new graphql.GraphQLList(userType),
        resolve(){
          return new Promise((resolve, reject) => {
            User.getAllUser({}, (err, docs) => {
              if (err) reject({msg: "Invalid request"})
              else resolve(docs)
            })
          });
        }
      },
      user:{
          type: userType,
          args: {
            _id: {type: graphql.GraphQLString}
          },
          resolve: (root, args, context) => {
            return new Promise((resolve, reject) => {
              User.getUser({_id: args._id}, (err, user) => {
                if (err) return reject({msg: "Invalid request"});
                if (!user) resolve({msg: 'User not found !'})
                else resolve(user);
              })
            })
          }
      }
  }
})

const mutation = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields:{
    add:{
      type: userType,
      description: 'Add user',
      args: {
        username: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        email: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        password: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
      },
      resolve(root,args){
        var newUser = new User(args);
        return new Promise((resolve, reject) => {
          User.createUser(newUser, (err) => {
            if (err) return reject({msg: "Invalid request"})
            else resolve(newUser);
          })
        })
      }
    },
    delete: {
      type: userType,
      description: 'Delete user',
      args: {
        _id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
      },
      resolve(root,args){
        return new Promise((resolve, reject) => {
          User.deleteUser(args._id, (err) => {
            if (err) return reject({msg : "Invalid request"})
            else resolve({msg: 'Delete user successfully !'})
          })
        })
      }
    },
    edit: {
      type: userType,
      description: 'Update user',
      args: {
        _id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        name: {type: graphql.GraphQLString},
        username: {type: graphql.GraphQLString},
        email: {type: graphql.GraphQLString},
      },
      resolve(root,args){
        return new Promise((resolve,reject) => {
          User.getUser({_id: args._id}, (err,user) => {
            if (err) return reject({msg: "Invalid request"});
            if (!user) reject({msg: 'User not found !'});
            let correctUser = {
              name: args.name || user.name,
              email: args.email || user.email,
              username: args.username || user.username,
              password: user.password
            }
            User.correctUser({_id: args._id}, correctUser, (err,docs) => {
              if (err) return resolve({msg: "Invalid request"})
              else resolve(docs);
            })
          })
        })
      }
    }
  }
})

module.exports = new graphql.GraphQLSchema({
    query: queryType,
    mutation
})
