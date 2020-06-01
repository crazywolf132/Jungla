# Jungla

## What is it?

Jungla is a data manipulation language built to enhance the capabilities of your pre-existing APIs.

Jungla is a language inspired by GraphQL.

## What Jungla looks like...

```Jungla
# "extensions.jungla"

{
    some {
        deep {
            down {
                data {
                    id is NUMBER,
                    name is STRING,
                    age,
                    company {
                        name,
                        &address
                    }
                }
            }
        }
    }
}

```
