export type ExpenseCategory = 'FUEL' | 'TOLL' | 'OIL' | 'MAINTENANCE';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'PARTIAL' | 'REJECTED';

export type DriverUser = {
  id: string;
  username: string;
  role: 'DRIVER';
};

export type DriverExpense = {
  id: string;
  driverId: string;
  category: ExpenseCategory | string;
  amount: number;
  approvedAmount: number | null;
  status: ExpenseStatus | string;
  adminNotes: string | null;
  odometerImage: string | null;
  pumpImage: string | null;
  receiptImage: string | null;
  tollImage: string | null;
  linkedExpenseId: number | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type PhotoSlot =
  | 'odometerImage'
  | 'pumpImage'
  | 'tollImage'
  | 'receiptImage';

export type CategoryConfig = {
  key: ExpenseCategory;
  labelAr: string;
  description: string;
  requiredPhotos: PhotoSlot[];
  optionalPhotos: PhotoSlot[];
};

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    key: 'FUEL',
    labelAr: 'جاز / وقود',
    description: 'المبلغ + صورة العداد + صورة المضخة',
    requiredPhotos: ['odometerImage', 'pumpImage'],
    optionalPhotos: [],
  },
  {
    key: 'TOLL',
    labelAr: 'كارتة',
    description: 'المبلغ + صورة تذكرة الكارتة',
    requiredPhotos: ['tollImage'],
    optionalPhotos: [],
  },
  {
    key: 'OIL',
    labelAr: 'غيار زيت',
    description: 'المبلغ + صورة العداد',
    requiredPhotos: ['odometerImage'],
    optionalPhotos: [],
  },
  {
    key: 'MAINTENANCE',
    labelAr: 'صيانة',
    description: 'المبلغ + صورة العداد + فاتورة (اختياري)',
    requiredPhotos: ['odometerImage'],
    optionalPhotos: ['receiptImage'],
  },
];

export const PHOTO_LABELS: Record<PhotoSlot, string> = {
  odometerImage: 'صورة العداد',
  pumpImage: 'صورة المضخة',
  tollImage: 'صورة تذكرة الكارتة',
  receiptImage: 'صورة الفاتورة',
};
