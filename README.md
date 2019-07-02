## [ReSolve](https://github.com/reimagined/resolve) Cloud Platform Command Line Interface

This package provides an interface used to deploy [reSolve](https://github.com/reimagined/resolve) applications to the cloud.

## Usage

Use the following console inputs to add this CLI to your reSolve project, login to the reSolve Cloud Platform and deploy the application:

```sh
yarn create resolve-app resolve-app
cd resolve-app
<develop your app locally>
yarn add resolve-cloud
yarn resolve-cloud login
yarn resolve-cloud deploy
```

### Install the CLI

The reSolve Cloud Platform CLI is available on NPM. You can add it to a project as shown below:

```
yarn add resolve-cloud
```

### Log in to the reSolve Cloud Platform

Use the `login` command to authenticate and authorize to the reSolve cloud platform.

```
yarn resolve-cloud login
```

The CLI manages an authentication session so you stay logged in between queries.

## Manage Deployments

Use the `deploy` command to deploy an application to the cloud.

```
yarn resolve-cloud deploy
```

The cloud platform assigns an ID to an application deployment.

Pass a deployment's ID to the `remove` command to remove this deployment.

```
yarn resolve-cloud remove <ID>
```

## View Deployment information

To view the list of all your deployments, type:

```
yarn resolve-cloud list
```

Use the `describe` command to view information on a specific deployment.

```
yarn resolve-cloud describe <ID>
```

## Manage Read Models

The `read-models` command manages the application's read models.

View a deployed application's read models:

```
yarn resolve-cloud read-models list <ID>
```

You can pause and resume read model updatess:

```
yarn resolve-cloud read-models pause <ID> <read model name>
```

```
yarn resolve-cloud read-models resume <ID> <read model name>
```

Reset a read model's persistent state.

```
yarn resolve-cloud read-models reset <ID> <read model name>
```

## Manage Sagas

The `sagas` command manages the application's sagas.

View a list of available sagas:

```
yarn resolve-cloud sagas list <ID>
```

Pause and resume a saga.

```
yarn resolve-cloud sagas pause <ID> <saga name>
```

```
yarn resolve-cloud sagas resume <ID> <saga name>
```

Reset a saga's persistent state.

```
yarn resolve-cloud sagas reset <ID> <saga name>
```

### Manage Saga Properties

Use the `sagas properties` command to manage a saga's properties.

Add a property:

```
yarn resolve-cloud sagas properties add <ID> <saga name> <property name> <value>
```

View all saga's properties:

```
yarn resolve-cloud sagas properties list <ID> <saga name>
```

Remove a property:

```
yarn resolve-cloud sagas properties remove <ID> <saga name> <property name>
```

Update a property's value:

```
yarn resolve-cloud sagas properties update <ID> <saga name> <property name> <new value>
```

## Specify Environment Variables

The following commands allow you to manage environment variables available for a deployment:

Set environment variables:

```
yarn resolve-cloud environment set <ID> <key=value pairs>
```

Remove an environment variable:

```
yarn resolve-cloud environment remove <ID> <list of variable names>
```

## View Logs

Use the `logs` command to view and manage application logs.

View logs:

```
yarn resolve-cloud logs get <ID>
```

Remove logs:

```
yarn resolve-cloud logs remove <ID>
```

## View Help

To view help on this CLI, type:

```
yarn resolve-cloud --help
```

You can also view help for a specific command, for example:

```
yarn resolve-cloud deploy --help
```
