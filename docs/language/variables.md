## Variables

!> All Variables must be defined before their use.

### Defining variables

Variables in Jungla, are slightly different to what some expect.
All variables must begin with `@`, this indicates to the system to store
it in memory and not add it to the output unless referenced

```Jungla
    @MyVar {
        date,
        name
    }
```

?> Generally you fill the inside of your variable with more fields, or default values.

### References

To Call upon a previously created variable, we use the `&` symbol, before
the variable name. This allows for us to name the variable the same name
as some of our data fields.

```Jungla
    &MyVar
```

Example 2:

```Jungla
    data {
        &MyVar
    }
```

You can also rename the References like so...

```Jungla
    data {
        &MyVar as AnotherName
    }
```

!> You can NOT re-value a variable once created
