import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Blueprint-synchronized sanitization helpers (matching firebase-blueprint.json & firestore.rules)
const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function sanitizeFirestoreId(raw: string, fallback = 'wallet_user', maxLen = 128): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLen);
  if (!cleaned || !SAFE_ID_REGEX.test(cleaned)) {
    return fallback;
  }
  return cleaned;
}

export type SupportedWalletNetwork =
  | 'Bitcoin'
  | 'Xaman_XRPL'
  | 'XRPL'
  | 'Stellar'
  | 'EVM_TrustExtension';

export async function signInWithGoogleForWallet(): Promise<User> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          'ANDROID_POPUP_BLOCKED: Google Sign-In popup did not open on this mobile browser. Use 1-Tap Classroom Sign-Off right beside it to unlock instantly.'
        )
      );
    }, 9000);
  });

  try {
    const credential = await Promise.race([
      signInWithPopup(auth, googleProvider),
      timeoutPromise,
    ]);
    return credential.user;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function signOutGoogleWalletGate(uid?: string): Promise<void> {
  if (uid && auth.currentUser && auth.currentUser.uid === uid && auth.currentUser.emailVerified) {
    try {
      await lockLiveWalletSessionInFirestore(uid);
    } catch {
      // Proceed with sign-out even if session doc was never created
    }
  }
  await signOut(auth);
}

export async function unlockLiveWalletSessionInFirestore(
  user: User,
  walletNetwork: SupportedWalletNetwork
): Promise<void> {
  if (!user.emailVerified) return;
  const safeUid = sanitizeFirestoreId(user.uid, 'uid_fallback', 128);
  const userPath = `users/${safeUid}`;
  const userRef = doc(db, 'users', safeUid);

  let existsAlready = false;
  try {
    const snap = await getDoc(userRef);
    existsAlready = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (!existsAlready) {
    try {
      await setDoc(userRef, {
        uid: safeUid,
        walletModeUnlocked: true,
        lastWalletNetwork: walletNetwork,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  } else {
    try {
      await updateDoc(userRef, {
        walletModeUnlocked: true,
        lastWalletNetwork: walletNetwork,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  }
}

export async function lockLiveWalletSessionInFirestore(uid: string): Promise<void> {
  const safeUid = sanitizeFirestoreId(uid, 'uid_fallback', 128);
  const userPath = `users/${safeUid}`;
  const userRef = doc(db, 'users', safeUid);

  let existsAlready = false;
  try {
    const snap = await getDoc(userRef);
    existsAlready = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (existsAlready) {
    try {
      await updateDoc(userRef, {
        walletModeUnlocked: false,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  }
}

export interface RecordWalletApprovalInput {
  user: User;
  walletNetwork: SupportedWalletNetwork;
  setNumber: number;
  coinTicker: 'BTC' | 'XRP' | 'XLM';
  walletTarget: 'TrustWallet' | 'Xaman' | 'TrustExtension';
  publicWalletAddress: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  markSigned?: boolean;
}

export async function recordWalletSetApprovalInFirestore(
  input: RecordWalletApprovalInput
): Promise<void> {
  const { user } = input;
  if (!user.emailVerified) return;

  // Ensure parent Master Gate session is active first
  await unlockLiveWalletSessionInFirestore(user, input.walletNetwork);

  const safeUid = sanitizeFirestoreId(user.uid, 'uid_fallback', 128);
  const clampedSet = Math.max(1, Math.min(10, Math.round(input.setNumber)));
  const approvalId = `set_${clampedSet}`;
  const approvalPath = `users/${safeUid}/walletApprovals/${approvalId}`;
  const approvalRef = doc(db, 'users', safeUid, 'walletApprovals', approvalId);

  const safeAddr = sanitizeFirestoreId(
    input.publicWalletAddress || 'SELF_CUSTODY_WALLET',
    'SELF_CUSTODY_WALLET',
    96
  );
  const safeAddressPadded = safeAddr.length >= 4 ? safeAddr : 'SELF_CUSTODY_WALLET';
  const safeBuy = Math.max(0.0001, Math.min(1000000, Number(input.buyPrice) || 0.0001));
  const safeSell = Math.max(0.0001, Math.min(1000000, Number(input.sellPrice) || 0.0001));
  const safeQty = Math.max(0.00000001, Math.min(100000000, Number(input.quantity) || 0.00005));
  const desiredStatus: 'dispatched' | 'signed' = input.markSigned ? 'signed' : 'dispatched';

  let existingStatus: string | null = null;
  try {
    const snap = await getDoc(approvalRef);
    if (snap.exists()) {
      existingStatus = (snap.data()?.status as string) || 'dispatched';
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, approvalPath);
  }

  if (existingStatus === null) {
    try {
      await setDoc(approvalRef, {
        ownerUid: safeUid,
        setNumber: clampedSet,
        coinTicker: input.coinTicker,
        walletTarget: input.walletTarget,
        publicWalletAddress: safeAddressPadded,
        buyPrice: safeBuy,
        sellPrice: safeSell,
        quantity: safeQty,
        status: desiredStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, approvalPath);
    }
    return;
  }

  // Respect terminal 'signed' state lock in firestore.rules
  if (existingStatus === 'signed') {
    return;
  }

  if (desiredStatus === 'signed') {
    try {
      await updateDoc(approvalRef, {
        status: 'signed',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, approvalPath);
    }
  } else {
    try {
      await updateDoc(approvalRef, {
        walletTarget: input.walletTarget,
        publicWalletAddress: safeAddressPadded,
        buyPrice: safeBuy,
        sellPrice: safeSell,
        quantity: safeQty,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, approvalPath);
    }
  }
}

export interface BatchTenSetItemInput {
  setNumber: number;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
}

export async function recordBatchTenSetApprovalsInFirestore(params: {
  user: User;
  walletNetwork: SupportedWalletNetwork;
  coinTicker: 'BTC' | 'XRP' | 'XLM';
  walletTarget: 'TrustWallet' | 'Xaman' | 'TrustExtension';
  publicWalletAddress: string;
  sets: BatchTenSetItemInput[];
}): Promise<void> {
  if (!params.user.emailVerified) return;
  await unlockLiveWalletSessionInFirestore(params.user, params.walletNetwork);
  for (const s of params.sets) {
    await recordWalletSetApprovalInFirestore({
      user: params.user,
      walletNetwork: params.walletNetwork,
      setNumber: s.setNumber,
      coinTicker: params.coinTicker,
      walletTarget: params.walletTarget,
      publicWalletAddress: params.publicWalletAddress,
      buyPrice: s.buyPrice,
      sellPrice: s.sellPrice,
      quantity: s.quantity,
      markSigned: false,
    });
  }
}

export { onAuthStateChanged };
export type { User };
