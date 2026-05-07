# Community Marketplace - MCA Final Year Project

A modern React Native mobile application for buying and selling products within a community. Built with Expo, Firebase, and Clerk authentication.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Google OAuth via Clerk
- ✅ **Product Management** - Create, view, and delete posts
- ✅ **Image Upload** - Compressed image upload to Firebase Storage
- ✅ **Search & Filter** - Real-time search with category filtering
- ✅ **Favorites System** - Save and manage favorite products
- ✅ **User Profiles** - View and manage user information
- ✅ **Product Details** - Full product information with seller contact
- ✅ **Share Products** - Share products via native share dialog
- ✅ **My Products** - View all your listed products
- ✅ **Pull to Refresh** - Refresh data with pull gesture

### Technical Features
- ✅ **Secure Configuration** - Environment variables for API keys
- ✅ **Service Layer** - Organized Firebase operations
- ✅ **Error Handling** - Comprehensive error handling
- ✅ **Form Validation** - Yup schema validation
- ✅ **Loading States** - Activity indicators and loading screens
- ✅ **Empty States** - User-friendly empty state screens
- ✅ **Image Compression** - Optimize images before upload
- ✅ **Responsive Design** - Adapts to different screen sizes

## 📱 Screenshots

[Add your app screenshots here]

## 🛠️ Technology Stack

- **Frontend:** React Native, Expo
- **Navigation:** React Navigation
- **Backend:** Firebase (Firestore, Storage)
- **Authentication:** Clerk (Google OAuth)
- **Form Handling:** Formik & Yup
- **Styling:** NativeWind, Custom Styles

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Clerk account
- iOS Simulator or Android Emulator (or physical device)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd comunity-marketplace
```

2. **Install dependencies**
```bash
npm install
```

3. **Install additional required package**
```bash
npm install expo-image-manipulator
```

4. **Create .env file**

Create a `.env` file in the root directory and add your credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

5. **Configure Firebase**

- Go to Firebase Console
- Create a new project
- Enable Firestore Database
- Enable Storage
- Copy the rules from `firestore.rules` and `storage.rules` to Firebase Console

6. **Configure Clerk**

- Go to Clerk Dashboard
- Create a new application
- Enable Google OAuth
- Copy the publishable key to `.env`

7. **Start the app**
```bash
npx expo start
```

## 📁 Project Structure

```
comunity-marketplace/
├── Apps/
│   ├── Components/          # Reusable components
│   ├── Navigators/          # Navigation configuration
│   ├── Screen/              # Screen components
│   │   ├── Original screens
│   │   └── Improved screens (with "Improved" suffix)
│   ├── Services/            # Firebase service layer
│   └── Utils/               # Utility functions
├── assets/                  # Images and fonts
├── firebaseConfig.js        # Firebase configuration
├── App.js                   # Root component
├── .env                     # Environment variables
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
├── TECHNICAL_DOCUMENTATION.md
├── IMPLEMENTATION_GUIDE.md
└── package.json
```

## 🔄 Using Improved Versions

The project includes improved versions of key screens with enhanced features:

### Improved Screens Available:
- `HomeImproved.js` - With search and filter
- `AddPostImproved.js` - With better validation and error handling
- `ExploreScreenImproved.js` - With search functionality
- `ProductDetailImproved.js` - With favorites feature
- `MyProductsImproved.js` - Enhanced user products view
- `FavoritesScreen.js` - New favorites screen

### To Use Improved Versions:

Update your navigation files to import improved versions:

```javascript
// Example: In HomeScreenStackNav.js
import HomeImproved from '../Screen/HomeImproved';

<Stack.Screen name="Home" component={HomeImproved} />
```

See `IMPLEMENTATION_GUIDE.md` for detailed instructions.

## 🔐 Security

### Environment Variables
All sensitive credentials are stored in `.env` file which is excluded from version control.

### Firebase Security Rules
- Firestore rules ensure users can only modify their own posts
- Storage rules limit file size and type
- Read access is public, write access requires authentication

## 📚 Documentation

- **TECHNICAL_DOCUMENTATION.md** - Complete technical documentation
- **IMPLEMENTATION_GUIDE.md** - Step-by-step implementation guide
- **firestore.rules** - Firestore security rules
- **storage.rules** - Storage security rules

## 🧪 Testing

### Manual Testing Checklist
- [ ] User can login with Google
- [ ] User can create a post with image
- [ ] User can view all posts
- [ ] User can search posts
- [ ] User can filter by category
- [ ] User can view product details
- [ ] User can contact seller
- [ ] User can delete own posts
- [ ] User can add/remove favorites
- [ ] User can view their products
- [ ] User can logout

## 🚀 Deployment

### Build for Android
```bash
npx expo build:android
```

### Build for iOS
```bash
npx expo build:ios
```

### Using EAS Build
```bash
eas build --platform android
eas build --platform ios
```

## 🐛 Troubleshooting

### Environment variables not loading
```bash
npx expo start -c
```

### Firebase permission denied
- Check Firebase security rules in console
- Verify user is authenticated

### Images not uploading
- Check Firebase Storage rules
- Verify file size < 5MB
- Check internet connection

### Module not found
```bash
rm -rf node_modules
npm install
npx expo start -c
```

## 📈 Future Enhancements

- [ ] Push notifications
- [ ] In-app chat between users
- [ ] Product reviews and ratings
- [ ] Advanced search filters (price range, location)
- [ ] Firebase Analytics integration
- [ ] Offline support
- [ ] Multiple images per product
- [ ] Payment integration
- [ ] Admin panel
- [ ] Report system

## 🤝 Contributing

This is an MCA final year project. Contributions, issues, and feature requests are welcome!

## 📝 License

This project is for educational purposes (MCA Final Year Project).

## 👨‍💻 Author

[Your Name]
MCA Final Year Student
[Your College Name]

## 🙏 Acknowledgments

- Expo team for the amazing framework
- Firebase for backend services
- Clerk for authentication
- React Native community

## 📞 Contact

For any queries regarding this project:
- Email: [your-email]
- GitHub: [your-github]

---

**Note:** This project demonstrates modern mobile app development practices including secure configuration, clean architecture, and user-friendly features suitable for an MCA final year project.
