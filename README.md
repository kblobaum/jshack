Javascript Hacks for Blackboard
===============================

JS Hack is a Building Block for the Blackboard Learn LMS, which allows the injection
of arbitrary HTML and Javascript into the Blackboard UI.


Download
--------
You can find the latest binary version of JS Hack at the
[JSHack Oscelot Project Page](http://projects.oscelot.org/gf/project/jshack/frs/?action=FrsReleaseBrowse&frs_package_id=360)
If you come across an issue in JSHack V1, Please either:

- post to the forums in the JSHack project.
- or post to the bb-open_src mailing list.

Before you Begin
----------------
The project is split into four parts

- api - the non-bb non-web parts of jshack.
- common-web - which contains the web resources for the final Building block,
  and also for performing development work without a Bb instance.
- test-web - the server-side resources for doing UI and non-bb specific development
- b2 - all the Bb specific code required for deploying the B2 to a Bb instance.

The following frameworks and tools are being used in JSHack

* [Google Closure](https://developers.google.com/closure/library/) - for developing the Javascript UI.
  <br>Closure is *Big*, so don't freak out if you have trouble understanding it all at first.
  It does get easier.
* [Plovr](http://plovr.com/) - for making it easier to develop in Closure
* [Glovr](https://github.com/AllTheDucks/glovr) - a gradle wrapper around Plovr
* [Gradle](http://www.gradle.org/) - a build tool
* [Stripes](http://www.stripesframework.org/display/stripes/Home) - an MVC web framework
* [Jersey](https://jersey.java.net/) - a Web Services framework


Building the Project to Deploy to Blackboard
--------------------------------------------
Please Note.  This version of JSHack is still under heavy development, and won't
work if you deploy it to Blackboard. However, if you'd like to build it anyway,
do as follows.

1. Clone this git repository.
2.  Execute
    > gradlew jshack-b2:war

Building and Developing without Blackboard
------------------------------------------
Most of the JSHack building block can be developed without using Blackboard. To
do this, you'll need to execute two gradle tasks (in different cmd prompts),
which will run an instance of plovr, and an instance of Jetty.

> gradlew jshack-test-web:jettyRunWar

will compile and build the web app, and deploy it an instance of Jetty.

> gradlew jshack-common-web:plovrServe

will run an instance of Plovr, which allows changes to the javascript to be
viewed without rebuilding and deploying the entire web application.


Committing Code
---------------
Please adhere to the coding conventions as used in the project. Most importantly,
make sure you run the Closure Linter and Compiler before comitting any code.

You can do this by building the test-war:
> gradlew jshack-test-web:war

or
> gradlew jshack-common-web:gjslint
> gradlew jshack-common-web:plovrBuild

