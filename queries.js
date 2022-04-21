export const getTasks = `
query ($login: String!) {
    progress(
        order_by: {
            updatedAt: asc
        },
        where: {
            path: {
                _regex: "div-01/(?!piscine-js/)"
            },
            user: {
                login: {
                    _eq: $login
                }
            },
            isDone: {
                _eq: true
            }
        })
    {
        object {
            name
        }
        updatedAt
    }
}
`

export const getTaskXp = `
query($login: String!, $task: String!) {
transaction(
    limit: 1,
    where: {
    user: {
        login: {
        _eq: $login
        }
    },
    object: {
        name: {
        _eq: $task
        }
    },
    type: {
        _eq: "xp"
    }
    },
    order_by: {
    amount: desc_nulls_last
    }) {
        amount
    }
}
`


export const getTransactions = `
query($user: Int!, $type: String!, $offset: Int!) {
  transaction(
    offset: $offset,
    where: {
      userId: {_eq: $user}, 
      type: {_eq: $type} 
    }
  ) {
    amount
  }
}
`