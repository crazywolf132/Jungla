<p align="center">
    <img src="./assets/img/Headers/Defaults.svg" height="75px" alt="Defaults"  title="Defaults">
</p>
<br />

Ever had data where a field is present in one object, but not another?
Defaults help you fix that. Simply tell JUNGLA what you want the fallback value to be, and it will ensure every object has that field.

Here is an example

**_DATA_**

```json
[
	{
		"name": "Dave",
		"company": "Google",
		"dog": "Harry"
	},
	{
		"name": "Peter",
		"company": "Google",
		"dog": "Jeff"
	},
	{
		"name": "Steve",
		"company": "Bing",
		"cat": "Steven Jr."
	}
]
```

**_QUERY_**

```Jungla
{
    name,
    cat = false,
    dog = false
}
```

**_RESULT_**

```json
[
	{
		"name": "Dave",
		"cat": false,
		"dog": "Harry"
	},
	{
		"name": "Peter",
		"cat": false,
		"dog": "Jeff"
	},
	{
		"name": "Steve",
		"cat": "Steven Jr.",
		"dog": false
	}
]
```
