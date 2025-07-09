# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

# E-Waste Recycling & Circular Economy App ♻️📱

## 🌟 Project Overview

This is a comprehensive mobile application designed to facilitate e-waste recycling, promote a circular economy, and offer a marketplace for refurbished and brand-new electronic products. It connects users for recycling, provides a platform for selling/donating e-waste, and educates on sustainable practices.

## ✨ Key Features

* **User Management:** Secure authentication with Clerk, including guest Browse, user profiles, and follower/following system.
* **Dynamic Post Feed:** Browse a feed of posts with images, captions, likes, and comments. Supports infinite scrolling and search.
* **Guest Mode:** Unauthenticated users can browse posts, like, and bookmark items. Their data is seamlessly migrated upon sign-up/login.
* **E-waste Contribution:** Users can list their e-waste products for recycling or donation, specifying details like category, brand, model, and condition.
* **Product Marketplace:**
    * **Brand New Products:** Explore and purchase new electronic items from various brands.
    * **Refurbished Products:** Discover and buy quality refurbished electronics, promoting sustainability.
* **Shopping Cart & Orders:** Add products to a cart and manage past orders with details like total amount and status.
* **Recycling Request Scheduling:** Schedule e-waste pickups with delivery agents, including address and time slot preferences.
* **Interactive AI Chat:** An integrated AI assistant to answer questions about e-waste, recycling processes, or products.
* **Community Engagement:**
    * Notifications for likes, comments, and follows.
    * "Recycle Vote" feature to encourage participation in recycling goals.
    * Personalized recycling goals and progress tracking.
* **Comprehensive Feedback System:** Users can provide feedback on the app experience.
* **User Address Management:** Store multiple addresses (home, office) for convenience.

## 🚀 Technologies Used

* **Frontend:** React Native (with Expo)
* **Backend:** Convex (Realtime backend as a service for database and functions)
* **Authentication:** Clerk (for user authentication and management)
* **State Management:** React Context API (for guest authentication, network status)
* **Local Storage:** `@react-native-async-storage/async-storage` (for guest ID persistence)
* **Unique IDs:** `uuid` (for generating unique guest IDs)
* **Database Schema:** Defined in Convex, including robust indexing for efficient queries.
* **UI/UX:** `react-native-gesture-handler`, `@expo/vector-icons`, Lottie animations, Custom Components.
* **Charting:** `react-native-chart-kit` (for e-waste statistics)
* **Navigation:** Expo Router

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
