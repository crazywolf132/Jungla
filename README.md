<p align="center">
<img src="./docs/assets/img/Jungla.svg" height="200px" alt="Jungla"  title="WQL Lang">
</p>

<b>Version</b> <small>1.2-Beta</small>

---

## What is it?

Jungla is a data manipulation language built to enhance the capabilities of your pre-existing APIs.

Jungla is a language inspired by GraphQL.

## What Jungla looks like...

```graphql
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
