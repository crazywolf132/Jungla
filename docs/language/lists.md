<p align="center">
    <img src="./assets/img/Headers/Lists.svg" height="75px" alt="Lists"  title="Lists">
</p>
<br />

Lists are a large part of data. So, it is only realistic
that people want to be able to choose what fields they want back from
them too.

Jungla allows you to choose which fields you want out of objects in lists extremely easily.

?> You can still use the `as` operator on all lists

Here is an example, then we will explain it.

```json
{
	"company": "myCompany",
	"companyContacts": {
		"phone": "123-123-1234",
		"email": "email@company.com"
	},
	"employees": [
		{
			"id": 101,
			"name": "John",
			"contacts": ["email@employee1.com", "email2@employee1.com"]
		},
		{
			"id": 102,
			"name": "William",
			"contacts": null
		}
	]
}
```

```Jungla
    {
        employees : [
            {
                id,
                name
            }
        ]
    }
```

### How it works

Using the `:` character after a field, we are telling the system that we are expecting the data to be a certain way. We then use `[]` to define that it is going to be a list.

Inside the Square Brackets, we then create our object like normal. As this
just declares what we would like for each item in the list.

Eg.

```Jungla
{
    id,
    name

```

?> If the field is not a list... it will still treat it like a list, and any fields your asking to be inside it... will all be `undefined`

### List Size Definitions

Not everyone wants everything from a list, sometimes you only want a specific number of items. Jungla accomodates for this.

Using the `<SIZE_NUMBER_HERE>` in your list definition, allows for you
to specify the maximum size of the list.

Here is an example.

```Jungla
    {
        employees <1> : [
            {
                id,
                name
            }
        ]
    }
```

?> List size, starts at 1. It will also not create extra items if they dont exist.
