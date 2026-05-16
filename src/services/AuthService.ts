import { currentUserSignal, isAuthLoadingSignal } from "../signals/auth.signals";
import { isLoginModalOpenSignal } from "../signals/ui.signals";
import { getLoadedPocketBase, loadPocketBase } from "../utils/pocketBaseClient";
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
            if (credential.includes('@admin.electroprice.com') || credential === 'admin@electroprice.com') {
                await pb.admins.authWithPassword(credential, password);
            } else {
                await pb.collection('users').authWithPassword(credential, password);
            }
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
        try {
            const pb = await loadPocketBase();
            await pb.collection('users').authWithOAuth2({ provider: 'google' });
            NotificationService.success('Signed in with Google!');
        } catch (error: any) {
            console.error('Error signing in with Google:', error);
            NotificationService.error(error.message);
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
