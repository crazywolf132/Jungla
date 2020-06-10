<p align="center">
    <img src="./assets/img/Headers/Syntax.svg" height="75px" alt="Syntax"  title="Syntax">
</p>
<br />

### Comments

Jungla supports both single line and block comments.

```Jungla
    // I'm a single line comment
```

```Jungla
    /*
        I'm a block
        comment.
    */
```

### Import

Import is used to import other files before running the current file.

```Jungla
	# "lists.jungla";
```

A great use for this is predefined statements (if statements) and creating variables to be used everywhere.

!> File must end with `.jungla` or it will not allow it.

### Reserved Words

This is a set of words and characters that cannot be used as variable names, just like most other languages.

```Jungla
	is STRING NUMBER LIST LIST_KEYS
	OBJ @ # & as ->
```

### Identifiers

Identifiers in this language are case sensitive. They are used to define objects such as variables, classes and functions.
An identifier starts with a letter or an underscore, they can then proceed to use letters, numbers or underscores.

```Jungla
    A_VALID_EXAMPLE
    _So_am_I
    IH4V3_Numbers
    a2
```
