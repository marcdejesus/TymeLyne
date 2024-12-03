# Why are we rebuilding using React Native?
<p>Although we have used .NET Maui and familiarized ourselves with their DevOps, Microsoft discontinued support for Xamarin in May of 2024. The documentation we had to work with all semester was very minimal, leaving us to experiment and brute-force our front-end development (XAML). The smallest features could potentially take hours to implement, meaning we lacked an agile workflow. After researching more stable frameworks, I found that the best contenders for the best are React Native and Flutter. Both are viable options and are actively supported with updates, documentation, libraries, and many tutorials. The choice to use React Native instead of Flutter is due to the fact that React Native uses JavaScript and TypeScript, while Flutter uses its own language, Dart. JavaScript and TypeScript are more in demand than Dart due to the wider range of what we could accomplish with them and the ability to apply them outside of mobile app development. We are using TypeScript over JavaScript due to its static typing and optimization for larger-scale projects over JavaScript. </p>

# Requirements:

* VS Code (Dark Mode Theme)

* <a href="https://nodejs.org/en">Node.js</a>: v22.11.0 LTS

* <a href="https://docs.expo.dev/">Expo Documentation</a>: Set up an Expo account, Download Expo Go on your mobile device, and make sure you have the latest version of Expo installed.

# Initial Environment Setup:

* Install Node.js. Verify install with ```node -v``` and ```npm -v```. (You may have to restart your terminal)
* Install Expo: ```npm install expo```
* Open up the repository in Visual Studio Code (Can easily be done by cloning the repository in GitHub Desktop, and clicking the Open in Visual Studio Code drop-down option)
* Verify you have all of the latest packages installed locally. They will be listed in the section below.
* Refer to "How to test your current build:" to learn how to run the application.

# Required Packages

```
npm i react-native-bouncy-checkbox
```

# How to test your current build:

<p>If you are on MacOS, install HomeBrew and run the command: brew install watchman, if you're on Windows you should be fine.</p>
<p>Open your terminal in VS Code and make sure you're in the project directory. Navigate using cd command and pwd command to check</p>
<p>Run this command to run: npx expo start --reset-cache</p>
<p>Scan the QR code that appears in your terminal using your camera and the current build will open on your phone using Expo Go.</p>
<p>Enjoy features including live edits, performance metrics, and many more.</p>

# More advice:
* Work on a separate branch from main if you're implementing features that require more testing
* Work directly within the repository, so if you need to roll back to a previous commit, it's easier to do so through cmd line or git controls in VS Code</p>
* Push often on your branch whenever you have a stable build, so you can roll back to it if needed.
* Use Figma to assist in UI Design. Many assets are easily transferrable towards React Native, or at least easily replicable.

# What to do if you run into an issue?
<p>I ran into many issues during my initial build. Luckily for us, React Native and Expo have millions of users and plenty of resources online. If you're encountering any issues, paste your command line error into your browser or ChatGPT and you will have the proper guidance to overcome any issues you may encounter. Feel free to reach out to me as well with any questions.</p>

<p><i>-Marc De Jesus, Crunch Time Studios</i></p>
