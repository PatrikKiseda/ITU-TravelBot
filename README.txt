===============================================================================
ITU TravelBot - Project Structure and Authorship
===============================================================================

PROJECT STRUCTURE
===============================================================================

ITU-TravelBot/
├── be/                          Backend (FastAPI)
│   └── app/                     Application code
│
└── frontend/                    Frontend (React)
    ├── src/
    │   ├── components/         Reusable UI components
    │   ├── pages/              Page-level components
    │   ├── controllers/        Business logic controllers
    │   ├── services/           API service layer
    │   └── App.jsx             Main application component
    └── public/                  Static assets


===============================================================================
AUTHORSHIP
===============================================================================

BACKEND
===============================================================================
Author: Patrik Kišeda (xkised00)
Location: be/

===============================================================================
FRONTEND - BY FUNCTIONALITY
===============================================================================

ADMIN PANEL
Author: Shaposhnik Bogdan (xshapo04)
Location:
  - frontend/src/pages/Admin.jsx
  - frontend/src/pages/Admin.css
  - frontend/src/components/AdminOfferCard.jsx
  - frontend/src/components/AdminOfferCard.css
  - frontend/src/components/CreateOfferCard.jsx
  - frontend/src/components/CreateOfferCard.css
  - frontend/src/components/SimpleSearch.jsx
  - frontend/src/components/SimpleSearch.css
  - frontend/src/components/TagSearchSelector.jsx
  - frontend/src/components/TagSearchSelector.css
  - frontend/src/components/EditableField.jsx
  - frontend/src/components/EditableField.css
  - frontend/src/components/Modal.jsx
  - frontend/src/components/Modal.css
  - frontend/src/controllers/AdminOfferCardController.js
  - frontend/src/controllers/CreateOfferCardController.js
  - frontend/src/controllers/ModalController.js

CUSTOMER EXPLORE PANEL
Author: Patrik Kišeda (xkised00)
Location:
  - frontend/src/pages/Explore.jsx (explore page with filtering, sorting, and drag-and-drop status management)
  - frontend/src/pages/Explore.css
  - frontend/src/components/ExploreOfferCard.jsx (card component for displaying offers in explore view with swipe gestures)
  - frontend/src/components/ExploreOfferCard.css
  - frontend/src/components/FilterBar.jsx (filter bar component with price range slider and filter controls)
  - frontend/src/components/FilterBar.css
  - frontend/src/components/DestinationCard.jsx (card component for displaying accepted destinations)
  - frontend/src/components/DestinationCard.css
  - frontend/src/components/DestinationList.jsx (list component for displaying all accepted destinations)
  - frontend/src/components/DestinationList.css
  - frontend/src/components/InlineNote.jsx (inline note component with auto-save functionality)
  - frontend/src/components/InlineNote.css

CUSTOMER COMPARE VIEWS
Author: Patrik Kišeda (xkised00)
Location:
  - frontend/src/pages/Compare.jsx (compare page for side-by-side offer comparison)
  - frontend/src/pages/Compare.css
  - frontend/src/components/ComparisonView.jsx (side-by-side comparison view with synchronized scrolling)
  - frontend/src/components/ComparisonView.css
  - frontend/src/components/ComparisonCard.jsx (card component for displaying offers in comparison view)
  - frontend/src/components/ComparisonCard.css

ORDER CUSTOMISATION VIEW
Author: Andrej Mikus (xmikus19)
Location:
  - frontend/src/pages/Order.jsx (allows user to set additional requirements for his order)
  - frontend/src/pages/Order.css
  - frontend/src/components/GiftEmail.jsx (a form based component to store email data)
  - frontend/src/components/GiftEmail.css

ORDERS PANEL
Author: Andrej Mikus (xmikus19)
Location:
  - frontend/src/pages/Orders.jsx (list of all orders including those unconfirmed and cancelled)
  - frontend/src/pages/Orders.css
  - frontend/src/components/SwipeToCancel.jsx (a smart tool that allows user to cancel his order)
  - frontend/src/components/SwipeToCancel.css
  - frontend/src/components/Notify.jsx (a simple notify rectangle)
  - frontend/src/components/Notify.css

SHARED/COMMON COMPONENTS
Location:
  - frontend/src/components/Header.jsx
  - frontend/src/components/Header.css
  - frontend/src/App.jsx
  - frontend/src/App.css
  - frontend/src/services/api.js

===============================================================================
IMPORTANT FRONTEND LOCATIONS
===============================================================================

Main Application Entry:
  - frontend/src/main.jsx
  - frontend/src/App.jsx

Page Components:
  - frontend/src/pages/Explore.jsx        (Customer explore view)
  - frontend/src/pages/Compare.jsx        (Customer comparison view)
  - frontend/src/pages/Orders.jsx          (Customer orders list)
  - frontend/src/pages/Order.jsx           (Customer order detail/customization)
  - frontend/src/pages/Admin.jsx           (Admin panel)

Reusable Components:
  - frontend/src/components/              (All shared UI components)

Business Logic:
  - frontend/src/controllers/              (Component controllers)
  - frontend/src/services/api.js          (API communication layer)

===============================================================================

