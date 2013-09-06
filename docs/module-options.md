# Module Options

All options inherit from their parents, with the root level options existing on munit.defaults.settings


### expect

Number of expected tests to run. When less than 1, assumes synchronous module. Defaults to 0


### priority

Priority level of the test. Give higher priority for tests that should run first. Defaults to munit.PRIORITY_DEFAULT

* munit.PRIORITY_HIGHEST == 0.8
* munit.PRIORITY_HIGHER == 0.7
* munit.PRIORITY_HIGH == 0.6
* munit.PRIORITY_DEFAULT == 0.5
* munit.PRIORITY_LOW == 0.4
* munit.PRIORITY_LOWER == 0.3
* munit.PRIORITY_LOWEST == 0.2


### timeout

Number of milliseconds to wait for a module to complete. Only used in asynchronous module. Defaults to 3 seconds.


### stopOnFail

Exits the process when an error occurs. Defaults to false.


### autoQueue

Auto adds the queue object back to the stack once the module has completed. Defaults to true.


### queue

Defines module as a queue object. Set to true to take any object, or a string for specific object. Defaults to null.


### depends

Defines a list of modules that this module depends on before starting. Defaults to none.
