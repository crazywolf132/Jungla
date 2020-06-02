<p align="center">
    <img src="./assets/img/Headers/Control_Flow.svg" height="75px" alt="Control Flow"  title="Control Flow">
</p>
<br />

Jungla has a variety of control flow statements to help you with your code. Control flow is used to determine which chunks of code are run, and how many times.

### If statement

It can be handy to have the ability to run different sections of code, when under different conditions. An example of this might be an age checker for a movie.

**DATA**

```json
{
	"age": 17,
	"ticket1": "Nightmare On Elm Street",
	"ticket2": "Bugs Bunny"
}
```

```Jungla
{
    @adult {
        ticket1 as ticket
    },
    @child {
        ticket2 as ticket
    },
    {
        @age ~= 17 ? { &adult } : { &child },
        &age
    }
}
```

**Result**

```json
{
	"ticket": "Nightmare On Elm Street"
}
```

#### How it works

Using a [variable](language/variables.md) `@age`, we are assign it a value. The value just so happens to be an if else statement. We tell it, that it is
an if else statement with the `~` before the equals sign, as shown above.

After the `=` sign comes the value we are checking. The way this works is, whatever your variable is called, it will check the data with the same name, and compare it to the value provided. In this case, it will check `age` from the dataset, and compare it to `17` which comes after the `~=`.

Next comes the `?`, this is signifying the start of the if statement. This first part is what to do when the statement is true. Please pay attention to the below notice about what to put here.

After this, we then have the else part. This is signified using the `:` symbol.

!> This part is required.

What goes here is simply what to do when the condition is not true. Once again, pay attention to the notice below.

?> You can only use custom data for the `IF` and `ELSE` parts if you use a reference to another variable. Otherwise the system treats it like you are requesting a specific field from the dataset.

A javascript version of the above would be the following.

```javascript
data = {...} // This is just the data from above.
if (data.age === 17) {
    return { ticket : data.ticket1 };
} else {
    return { ticket: data.ticket2 };
}
```

### Different check types

-   `~>` -- Same as `>=`
-   `~<` -- Same as `<=`
-   `~=` -- Same as `===`
-   `~!` -- Same as `!=`

### Params

Params are a handy little function, they will allow you to completely ignore a whole data object if it doesn't meet your requirements.

This can be super handy when you want to cut the amount of data being returned. It also allows us to check against multiple fields at a time.

?> Params uses a very unique `OR` and `&` system. It is unlike any other language -- That we know of.

Here is an example of what it looks like.

**DATA**

```json
[
	{
		"age": 12,
		"name": "Frank",
		"address": "99 Hopkins road"
	},
	{
		"age": 42,
		"name": "Peter",
		"address": "12 Bugs Bunny Lane"
	}
]
```

**QUERY**

```Jungla
{
    person(name = "Frank", age = 12) {
        name,
        age,
        address
    }
}
```

**RESULT**

```json
{
	"person": {
		"name": "Frank",
		"age": 12,
		"address": "99 Hopkins road"
	}
}
```

As we can see, the query went through each `Person` object, but only added them to the result if they met the requirements. This is just a small example of its power. If you use the below mentioned `OR` and `&` system. You could check against every field.

### `OR` and `&` system

Jungla takes a different approach to the old fashioned `||` OR and `&&` AND statements, by making it easier to check multiple fields at the same time.

?> These can only be used in `PARAMS` for the moment

#### OR statements

In Jungla, we take a different approach to the classic `||` and `&&`. Rather than typing out something like the following.

```javascript
if (name === 'frank' || name === 'peter') {
	doSomething();
} else {
	doSomething();
}
```

You could type out the following instead

```Jungla
(name = "frank" || "peter")
```

Seems ok right? Well, it doesn't stop there. Not only can you check the same field against multiple values, you can also check the same value against multiple fields too. Here is another JavaScript → Jungla conversion to demonstrate.

```javascript
if (name === 'frank' || otherName === 'frank') {
	doSomething();
} else {
	doSomething();
}
```

would be converted to

```Jungla
(name || otherName = "frank")
```

Now, the brave few might be asking `What if I combined them, would it still work?` - The answer is YES.

```javascript
if (
	name === 'frank' ||
	otherName === 'frank' ||
	name === 'peter' ||
	otherName === 'peter'
) {
	doSomething();
} else {
	doSomething();
}
```

would very easily be converted to this

```Jungla
(name || otherName = "frank" || "peter")
```

How much nicer is that?!?

#### AND statements

The AND statement hasn't changed too much, instead of using an `&&` operator, instead we separate it with a `,`...

That's it! Nothing more, nothing less.

```javascript
if (
	(name === 'frank' ||
		otherName === 'frank' ||
		name === 'peter' ||
		otherName === 'peter') &&
	age === 12
) {
	doSomething();
} else {
	doSomething();
}
```

would happily convert to:

```Jungla
(name || otherName = "frank" || "peter", age = 12)
```
