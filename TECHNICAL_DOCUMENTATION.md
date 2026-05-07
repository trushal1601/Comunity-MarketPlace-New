# Community Marketplace - Technical Documentation

## Project Overview
A React Native mobile application for buying and selling products within a community. Built with Expo, Firebase, and Clerk authentication.

## Technology Stack

### Frontend
- **React Native** (0.74.1) - Mobile app framework
- **Expo** (~51.0.10) - Development platform
- **React Navigation** - Navigation library
- **Formik & Yup** - Form handling and validation
- **NativeWind** - Tailwind CSS for React Native

### Backend (Firebase)
- **Firestore** - NoSQL database for storing posts, categories, sliders
- **Firebase Storage** - Image storage
- **Firebase Authentication** - Via Clerk integration

### Authentication
- **Clerk** - User authentication with Google OAuth

## Project Structure

```
comunity-marketplace/
├── Apps/
│   ├── Components/
│   │   └── HomeScreen/
│   │       ├── Categories.js
│   │       ├── CategoriesImproved.js
│   │       ├── Header.js
│   │       ├── LatestItem.js
│   │       ├── PostItem.js
│   │       └── Slider.js
│   ├── Navigators/
│   │   ├── ExploreScreenStackNav.js
│   │   ├── HomeScreenStackNav.js
│   │   ├── ProfileStackNav.js
│   │   └── TabNavigation.js
│   ├── Screen/
│   │   ├── AddPost.js (Original)
│   │   ├── AddPostImproved.js (Enhanced)
│   │   ├── ExploreScreen.js (Original)
│   │   ├── ExploreScreenImproved.js (Enhanced)
│   │   ├── FavoritesScreen.js (New)
│   │   ├── Home.js (Original)
│   │   ├── HomeImproved.js (Enhanced)
│   │   ├── ItemList.js
│   │   ├── Login.js
│   │   ├── MyProducts.js (Original)
│   │   ├── MyProductsImproved.js (Enhanced)
│   │   ├── ProductDetail.js (Original)
│   │   ├── ProductDetailImproved.js (Enhanced)
│   │   └── ProfileScreen.js
│   ├── Services/
│   │   └── FirebaseService.js (New - Service layer)
│   └── Utils/
│       ├── Colors.js
│       └── ImageUtils.js (New)
├── assets/
├── firebaseConfig.js
├── App.js
├── .env (New - Environment variables)
└── package.json
```

## Key Features

### Implemented Features
1. **User Authentication**
   - Google OAuth via Clerk
   - Secure token storage

2. **Product Management**
   - Create, Read, Delete posts
   - Image upload with compression
   - Category-based organization
   - User-specific product listing

3. **Search & Filter**
   - Real-time search functionality
   - Category filtering
   - Combined search and filter

4. **Favorites System**
   - Save favorite products
   - View saved items
   - Toggle favorites

5. **User Profile**
   - View profile information
   - Navigate to different sections
   - Logout functionality

6. **Product Details**
   - Full product information
   - Contact seller via email
   - Share product
   - Delete own posts

### Technical Improvements

#### 1. Security Enhancements
- Environment variables for API keys
- Secure credential management
- .gitignore updated to exclude sensitive files

#### 2. Code Organization
- Service layer (FirebaseService.js) for all Firebase operations
- Separation of concerns
- Reusable utility functions

#### 3. Error Handling
- Try-catch blocks in all async operations
- User-friendly error messages
- Graceful fallbacks

#### 4. Performance Optimization
- Image compression before upload
- Efficient data fetching
- Pull-to-refresh functionality
- Loading states

#### 5. User Experience
- Activity indicators during loading
- Empty state screens
- Refresh controls
- Form validation with error messages

## Firebase Collections Structure

### UserPost Collection
```javascript
{
  id: "auto-generated",
  title: "string",
  desc: "string",
  price: "number",
  address: "string",
  category: "string",
  image: "url",
  userName: "string",
  userEmail: "string",
  userImage: "url",
  createdAt: "timestamp",
  views: "number",
  favorites: ["email1", "email2"]
}
```

### Category Collection
```javascript
{
  id: "auto-generated",
  name: "string",
  icon: "url"
}
```

### Sliders Collection
```javascript
{
  id: "auto-generated",
  name: "string",
  imageUrl: "url"
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## Installation & Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Install Additional Packages** (if needed)
```bash
npm install expo-image-manipulator
```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Firestore and Storage
   - Add your credentials to `.env`

4. **Configure Clerk**
   - Create a Clerk account
   - Set up Google OAuth
   - Add publishable key to `.env`

5. **Run the App**
```bash
npx expo start
```

## Firebase Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /UserPost/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      request.auth.token.email == resource.data.userEmail;
      allow delete: if request.auth != null && 
                      request.auth.token.email == resource.data.userEmail;
    }
    
    match /Category/{categoryId} {
      allow read: if true;
      allow write: if false; // Only admin can write
    }
    
    match /Sliders/{sliderId} {
      allow read: if true;
      allow write: if false; // Only admin can write
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /communityPost/{imageId} {
      allow read: if true;
      allow write: if request.auth != null &&
                     request.resource.size < 5 * 1024 * 1024 &&
                     request.resource.contentType.matches('image/.*');
    }
  }
}
```

## API Service Methods

### FirebaseService Methods

- `createPost(postData)` - Create new post
- `getPosts(limitCount, lastDoc)` - Get posts with pagination
- `getPostsByCategory(category)` - Filter posts by category
- `getUserPosts(userEmail)` - Get user's posts
- `deletePost(postId)` - Delete a post
- `searchPosts(searchTerm)` - Search posts
- `getCategories()` - Get all categories
- `getSliders()` - Get slider images
- `uploadImage(uri, path)` - Upload image to storage
- `toggleFavorite(postId, userEmail)` - Add/remove favorite
- `getFavorites(userEmail)` - Get user's favorites

## Usage Guide

### Using Improved Screens

To use the improved screens, update your navigation files:

**Example: Update HomeScreenStackNav.js**
```javascript
import HomeImproved from '../Screen/HomeImproved';

// Replace Home with HomeImproved in your stack
<Stack.Screen name="Home" component={HomeImproved} />
```

**Similarly update:**
- AddPost → AddPostImproved
- ExploreScreen → ExploreScreenImproved
- ProductDetail → ProductDetailImproved
- MyProducts → MyProductsImproved

### Adding Favorites Screen

Add to your navigation:
```javascript
import FavoritesScreen from '../Screen/FavoritesScreen';

<Stack.Screen 
  name="Favorites" 
  component={FavoritesScreen}
  options={{ title: 'My Favorites' }}
/>
```

## Testing Checklist

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
- [ ] Pull to refresh works
- [ ] Images load correctly
- [ ] Form validation works
- [ ] Error messages display properly

## Future Enhancements

1. **Push Notifications** - Firebase Cloud Messaging
2. **In-app Chat** - Real-time messaging between users
3. **Product Reviews** - Rating and review system
4. **Advanced Search** - Price range, location-based
5. **Analytics** - Firebase Analytics integration
6. **Offline Support** - Cache data for offline viewing
7. **Image Gallery** - Multiple images per product
8. **Payment Integration** - In-app payment system
9. **Admin Panel** - Manage users and content
10. **Report System** - Report inappropriate content

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Restart Expo dev server
   - Clear cache: `npx expo start -c`

2. **Firebase permission denied**
   - Check Firebase security rules
   - Verify user authentication

3. **Images not uploading**
   - Check Firebase Storage rules
   - Verify file size limits
   - Check internet connection

4. **Build errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear Expo cache: `npx expo start -c`

## Contributing

When contributing to this project:
1. Use the improved versions of screens
2. Follow the existing code structure
3. Add proper error handling
4. Update documentation
5. Test thoroughly before committing

## License

This project is for educational purposes (MCA Final Year Project).

## Contact

For issues or questions, please contact the project maintainer.
