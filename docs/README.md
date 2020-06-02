<p align="center">
<img src="./assets/img/Jungla.svg" height="200px" alt="Jungla"  title="Jungla">
</p>

## What is it?

Jungla is a data manipulation language built to enhance the capabilities of your pre-existing APIs.
Jungla isn't tied to any specific database or storage engine and is instead backed by your existing code and data.
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
