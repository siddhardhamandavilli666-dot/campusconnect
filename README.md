# CampusConnect

CampusConnect is a campus-focused service marketplace connecting students with service providers for printing, food, stationery, repairs, transport and other campus needs.

## Included Features

- Student registration and login
- Vendor registration and login
- JWT authentication with role-based access
- Students create service requests
- Vendors discover open requests and submit quotations
- Students accept quotations and create orders
- Razorpay Test Mode payment flow
- Vendor order status management
- Student reviews
- MySQL database
- Conditional service-request details
- File attachments for services that need them

## Service-specific request flow

### Printing
- File upload is required
- Supported: PDF, JPG/JPEG, PNG, DOC, DOCX
- Number of copies
- B&W or Color
- A4 or A3
- Single or Double side
- Description, location and optional budget

### Repair
- Device type
- Optional problem photo (JPG/PNG)
- Description, location and optional budget

### Stationery
- Optional reference photo (JPG/PNG)
- Description, location and optional budget

### Food
- No file upload
- Put food item, quantity and instructions in the description

### Transport
- Pickup location
- Drop location
- Date/time
- Number of people
- No file upload

### Other
- Optional PDF/JPG/PNG attachment

Vendors can view/download an attachment from an open request when one is available.

## File Upload Implementation

The backend uses Multer for `multipart/form-data` uploads. Multer is designed for handling multipart forms and exposes uploaded file metadata through `req.file`/`req.files`. urlMulter documentationhttps://expressjs.com/en/resources/middleware/multer/

For this student-project version, files are stored locally in `backend/uploads/` and served through `/uploads/...`.

> Important for deployment: local disk storage can be temporary on some cloud platforms. For production deployment, replace local storage with a persistent object-storage service such as S3 or Cloudinary.

## Setup

### 1. Database

Run:

```sql
SOURCE database/schema.sql;
```

If you already have the previous CampusConnect database, run:

```sql
SOURCE database/request_details_migration.sql;
```

This adds the service-specific request fields and the `request_attachments` table.

### 2. Backend

```powershell
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campusconnect
JWT_SECRET=replace_with_a_long_random_secret
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_secret
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```powershell
npm run dev
```

### 3. Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open:

`http://localhost:5173`

## Testing the complete flow

1. Register a Student account.
2. Register a Vendor account.
3. Student creates a Printing request and uploads a sample PDF/JPG/PNG/DOC/DOCX.
4. Confirm the request appears in the Student Dashboard.
5. Login as Vendor.
6. Confirm the request and its attachment appear in Vendor Dashboard.
7. Open the attachment using **View / Download**.
8. Submit a quotation.
9. Login as Student and accept the quotation.
10. Use **Pay** to open Razorpay Test Checkout.
11. Complete the test payment.
12. Confirm the order becomes PAID.
13. Login as Vendor and move the order to IN_PROGRESS and then COMPLETED.
14. Login as Student and submit a review after completion.

## Important

- Do not upload `backend/.env` to GitHub.
- Do not share your Razorpay secret.
- The upload size limit is 10 MB.
- Food and Transport intentionally do not show an upload field.
- Vendor accounts do not have a Create Request option.
