<h3>Why are we rebuilding using React Native?</h3>
<p>Although we have used .NET Maui and familiarized ourselves with their DevOps, Microsoft decided to discontinue support for Xamarin in May of 2024. The documentation we had to work with all semester was very minimal, leaving us to experiment and brute-force our frontend development (XAML). The smallest features could potentially take hours to implement, meaning we lacked an agile workflow. After researching more stable frameworks, the contenders for the best are React Native and Flutter. Both are viable options and are actively supported with updates, documentation, libraries, and many tutorials. The choice to use React Native instead of Flutter is due to the fact that React Native uses JavaScript and TypeScript, while Flutter uses its own language, Dart. JavaScript and TypeScript are more in demand than Dart due to the wider range of what we could accomplish with them and the ability to apply them outside of mobile app development.</p>

<h3>Requirements:</h3>

VS Code (Dark Mode Theme)

<a href="https://nodejs.org/en">Node.js</a>: v22.11.0 LTS

<a href="https://docs.expo.dev/">Expo Documentation</a>: Set up an Expo account, Download Expo Go on your mobile device, and make sure you have the latest version of Expo installed.

<h3>Initial Environment Setup:</h3>

<p>Run the following command: npx create-expo-app@latest --template</p>
<p>Select the Navigation (TypeScript) template and press Enter</p>
<p>Take all of the files from the repository, place them into your build, and click replace all duplicates.</p>
<p>Begin coding!</p>

<h3>How to test your current build:</h3>

<p>If you are on MacOS, install HomeBrew and run the command: brew install watchman</p>
<p>Open your terminal in VS Code and make sure you're in the project directory. Navigate using cd command and pwd command to check</p>
<p>Run this command to run: npx expo start --reset-cache</p>
<p>Scan the QR code that appears in your terminal using your camera and the current build will open on your phone using Expo Go.</p>
<p>Enjoy features including live edits, performance metrics, and many more.</p>

<h3>More advice:</h3>
<p>-Work on a separate branch from main if you're implementing features that require more testing</p>
<p>-Work directly within the repository, so if you need to roll back to a previous commit, it's easier to do so through cmd line or git controls in VS Code</p>
<p>-Use Figma to assist in UI Design. Many assets are easily transferrable towards React Native, or at least easily replicable.</p>

<h3>What to do if you run into an issue?</h3>
<p>I ran into many issues during my initial build. Luckily for us, React Native and Expo have millions of users and plenty of resources online. If you're encountering any issues, paste your command line error into your browser or ChatGPT and you will have the proper guidance to overcome any issues you may encounter. Feel free to reach out to me as well with any questions.</p>

<p><i>-Marc De Jesus, Crunch Time Studios</i></p>
