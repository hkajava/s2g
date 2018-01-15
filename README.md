# s2g
Students2Groups Meteor application. Noticed in Spanish conversation class that the teacher doesn't have a good method to divide students into small groups for conversation so this application will provide easy way to do that. Also testing Meteor/React technologies with this application.

![s2g screen cast](imports/filesforgithubREADME/s2g_screencast_20171116.gif "Students2Groups (css part not polished I know...)")
The UI is not yet polished, responsive or otherwise cool. Let's see if there is time to furher develop this app.

## Prerequisites for installation

meteor v.16+
eslint v.4+
node v. 8+
lessc v. 2.7+
jest v. 21.2+


## Installation

Do git clone on the project
```
>git clone git@github.com:hkajava/s2g.git
```

A custom version of react-rangeslider is needed.
In s2g folder
```
>npm install
>cd node_modules
>rm -rf react-rangeslider
>git clone git@github.com:hkajava/react-rangeslider
>cd react-rangeslider
>npm install
>npm run build
```


run
go to s2g main level
```
>meteor run
```

## Authors

* **Henri Kajava** - *Initial work* - (https://github.com/hkajava)
* **Renato Moraes De Bonilha** - *Algorithm development*

Dedicated to Spanish teacher Javier Lázaro Ramos.
