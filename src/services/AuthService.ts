import { currentUserSignal, isAuthLoadingSignal } from "../signals/auth.signals";
import { isLoginModalOpenSignal } from "../signals/ui.signals";
import { getLoadedPocketBase, loadPocketBase } from "../utils/pocketBaseClient";
import { requestGoogleCredential } from "../utils/googleIdentity";
import { NotificationService } from "./NotificationService";
import { mapUserRecord } from "../utils/mappers";
import type { SignUpCredentials } from "../types";


export class AuthService {
    static async signUp(credentials: SignUpCredentials) {
        const { name, email, phone, password } = credentials;
        try {
            const pb = await loadPocketBase();
            await pb.collection('users').create({
                email,
                phone,
                password,
                passwordConfirm: password,
                name: name,
                role: 'user',
            });
            return { error: null };
        } catch (error: any) {
            console.error("Error signing up:", error);
            let message = "No se pudo crear la cuenta.";
            if (error.data?.data?.email?.code === 'validation_invalid_email') {
                message = "El correo electrónico no es válido.";
            } else if (error.data?.data?.password?.code === 'validation_length_out_of_range') {
                message = "La contraseña debe tener al menos 8 caracteres.";
            }
            return { error: new Error(message) };
        }
    }

    static async signIn(credential: string, password: string) {
        try {
            const pb = await loadPocketBase();
            await pb.collection('users').authWithPassword(credential, password);
            return { error: null };
        } catch (error: any) {
            console.error("Error signing in:", error);
            let message = "Credenciales inválidas o servicio no disponible.";
            if (error.status === 400 || error.status === 404) {
                message = "Correo o contraseña incorrectos.";
            }
            return { error: new Error(message) };
        }
    }

    static async signInWithGoogle() {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            NotificationService.error('El inicio de sesión con Google no está configurado.');
            return;
        }
        try {
            const credential = await requestGoogleCredential(clientId);
            const pb = await loadPocketBase();
            const result = await pb.send('/api/electroprice/auth/google', {
                method: 'POST',
                body: { credential },
            }) as { token: string; record: any };
            pb.authStore.save(result.token, result.record);
            // No sign-in notification: logging in isn't a notable event (the
            // avatar/header updating is the feedback). Errors below still toast.
        } catch (error: any) {
            console.error('Error signing in with Google:', error);
            NotificationService.error(error?.message || 'No se pudo iniciar sesión con Google.');
        }
    }

    static signOut() {
        getLoadedPocketBase()?.authStore.clear();
        currentUserSignal.value = null;
    }

    static setLoginModal(isOpen: boolean) {
        isLoginModalOpenSignal.value = isOpen;
    }

    static async initializeAuthSync() {
        let isActive = true;
        let unsubscribe: (() => void) | undefined;

        try {
            const pb = await loadPocketBase();
            
            const handleAuthChange = async (_token: string, model: any) => {
               if (!isActive) return;
               if (model) {
                  currentUserSignal.value = mapUserRecord(model);
               } else {
                  currentUserSignal.value = null;
               }
               isAuthLoadingSignal.value = false;
            };

            if (pb.authStore.isValid) {
               await handleAuthChange(pb.authStore.token, pb.authStore.model);
            } else {
               currentUserSignal.value = null;
               isAuthLoadingSignal.value = false;
            }

            unsubscribe = pb.authStore.onChange(handleAuthChange);
        } catch (_error) {
            currentUserSignal.value = null;
            isAuthLoadingSignal.value = false;
        }

        return () => {
            isActive = false;
            unsubscribe?.();
        };
    }
}
