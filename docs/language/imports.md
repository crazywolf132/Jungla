<p align="center">
    <img src="./assets/img/Headers/Imports.svg" height="75px" alt="Imports"  title="Imports">
</p>
<br />

Jungla allows for you to add other jungla files to your request.

This could be a good way to attach code that you don't want to send through the network. This allows for your requests to be safer and smaller.

## How to import

Using the following line, but with your filename will import it before it reads the rest of your code.

```Jungla
    # "filename.jungla"
```

Simply add the import statement to the top of your request like so.

```Jungla
    # "extraFunctions.jungla"

    {
        people(name = "Brendon") {
            &detailsSchema,
            otherInformation {
                user = true
            }
        }
    }
```

?> In this example the `detailsSchema` reference is from the `extraFunctions.jungla` file.
