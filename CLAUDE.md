@AGENTS.md

Read `.cursor/rules` for project-specific instructions and guidelines.

## Never call `getName()` to name a thing

Write the name out as a literal string at every use site. `ServiceLocator.$.get( "VertixBase/Modules/ErrorAlertService" )`, never `ServiceLocator.$.get( ErrorAlertService.getName() )` - and the same for a logger owner, an event bus object name, an IPC action, a stored data key or anything else identified by name.

`getName()` is the declaration. Calling it at a use site makes the identifier derived rather than written, and a derived identifier is invisible to the one search that would find every user of it. It also turns a class rename into a silent repoint: the code still compiles, the string it resolves to is different, and whatever was filed under the old name is simply no longer found.

This extends `AGENTS.md`'s **UI Entity Names** section, which says the same thing about flows, states, transitions, buttons and modals. It applies to every name a `getName()` returns, including the service's own name inside the class that declares it.
