<p align="center">
    <img src="./assets/img/Headers/Types.svg" height="75px" alt="Types"  title="Types">
</p>
<br />

Unlike some other languages (GraphQL is a good example), Jungla does not require the user to define what type the data is going to be.

This results in the language being dynamically typed.

Though, we do allow for type declaration if required.

### `IS` Operator

When you want to define a type on a field, you can simply use the `is` operator. This will tell Jungla, to only fill that field if the data it is
looking at, matches that type. Here is an example.

```json
{
	"id": 01223,
	"name": "Steven",
	"age": 13,
	"pet": false
}
```

```Jungla
    {
        id is STRING,
        name is STRING,
        age is NUMBER,
        pet is BOOL
    }
```

**Result**

```json
{
	"name": "Steven",
	"age": 13,
	"pet": false
}
```

?> This is due to `id` not being of type `STRING`

### Available Types

-   `STRING`
-   `NUMBER`
-   `LIST`
-   `OBJ`
-   `BOOL`
