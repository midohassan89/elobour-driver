import { API_URL, apiHeaders, normalizeImageUrl } from '@/lib/config';
import type { DriverExpense, DriverUser, ExpenseCategory } from '@/lib/types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type LoginResponse = {
  ok: boolean;
  token: string;
  user: DriverUser;
  error?: string;
};

type ExpensesResponse = {
  expenses: DriverExpense[];
  error?: string;
};

type SubmitResponse = {
  ok: boolean;
  expense: DriverExpense;
  error?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      text || `Unexpected response (${res.status})`,
      res.status,
    );
  }
}

export async function loginDriver(
  username: string,
  password: string,
): Promise<{ token: string; user: DriverUser }> {
  const res = await fetch(`${API_URL}/api/driver/login`, {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ username, password }),
  });
  const body = await parseJson<LoginResponse>(res);
  if (!res.ok || !body.token) {
    throw new ApiError(body.error ?? 'فشل تسجيل الدخول', res.status);
  }
  return { token: body.token, user: body.user };
}

export async function fetchExpenses(token: string): Promise<DriverExpense[]> {
  const res = await fetch(`${API_URL}/api/driver/expenses`, {
    method: 'GET',
    headers: apiHeaders({ Authorization: `Bearer ${token}` }),
  });
  const body = await parseJson<ExpensesResponse>(res);
  if (!res.ok) {
    throw new ApiError(body.error ?? 'فشل تحميل المصروفات', res.status);
  }
  return body.expenses ?? [];
}

export type SubmitExpenseInput = {
  token: string;
  category: ExpenseCategory;
  amount: number;
  photos: Partial<
    Record<
      'odometerImage' | 'pumpImage' | 'tollImage' | 'receiptImage',
      string | null
    >
  >;
};

/** RN multipart file part — never pass a Blob / bare URI string. */
const getFileData = (uri: string) => {
  const filename = uri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;
  return { uri, name: filename, type };
};

/**
 * Use XMLHttpRequest for multipart uploads.
 * RN's fetch often throws "Unsupported FormDataPart implementation"
 * when FormData contains { uri, name, type } file parts.
 */
function postFormData(
  url: string,
  formData: FormData,
  headers: Record<string, string>,
): Promise<{ status: number; json: SubmitResponse }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.responseType = 'text';

    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() === 'content-type') return;
      xhr.setRequestHeader(key, value);
    });

    xhr.onload = () => {
      let json: SubmitResponse;
      try {
        json = JSON.parse(xhr.responseText || '{}') as SubmitResponse;
      } catch {
        reject(
          new ApiError(
            xhr.responseText || `Unexpected response (${xhr.status})`,
            xhr.status,
          ),
        );
        return;
      }
      resolve({ status: xhr.status, json });
    };

    xhr.onerror = () => {
      reject(new ApiError('تعذر الاتصال بالخادم', 0));
    };

    xhr.send(formData);
  });
}

export async function submitExpense(
  input: SubmitExpenseInput,
): Promise<DriverExpense> {
  const formData = new FormData();
  formData.append('category', input.category);
  formData.append('amount', String(input.amount));

  const odometerUri = input.photos.odometerImage;
  if (odometerUri) {
    formData.append('odometerImage', getFileData(odometerUri) as any);
  }

  const pumpUri = input.photos.pumpImage;
  if (pumpUri) {
    formData.append('pumpImage', getFileData(pumpUri) as any);
  }

  const tollUri = input.photos.tollImage;
  if (tollUri) {
    formData.append('tollImage', getFileData(tollUri) as any);
  }

  const receiptUri = input.photos.receiptImage;
  if (receiptUri) {
    formData.append('receiptImage', getFileData(receiptUri) as any);
  }

  const { status, json } = await postFormData(
    `${API_URL}/api/driver/expenses`,
    formData,
    apiHeaders({ Authorization: `Bearer ${input.token}` }),
  );

  if (status < 200 || status >= 300 || !json.expense) {
    throw new ApiError(json.error ?? 'فشل إرسال المصروف', status);
  }
  return json.expense;
}

/** Resolve relative upload paths from the ERP against the API origin. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return normalizeImageUrl(path);
  }
  return normalizeImageUrl(
    `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`,
  );
}
