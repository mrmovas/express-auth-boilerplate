document.addEventListener('alpine:init', () => {
    Alpine.store('auth', {
        user: null,
        session: null,
        baseUrl: '/api/auth',
        errorMessage: null,
        successMessage: null,


        async init() {
            const res = await fetch(this.baseUrl+"/get-session", {
                method: 'GET',
                credentials: 'include'
            })

            if(res.ok) {
                const data = await res.json()
                if(!data) return

                this.user = data.user
                this.session = data.session
            }
        },


        async login(email, password, redirectTo = '/profile') {
            const res = await fetch(this.baseUrl+"/sign-in/email", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            })

            if(!res.ok) {
                const data = await res.json()
                this.errorMessage = data.message || 'Login failed'
                this.successMessage = null
            }

            if(res.ok && redirectTo) {
                window.location.href = redirectTo
            }
        },


        async register(firstName, lastName, name, email, password, country, phoneNumber) {
            const res = await fetch(this.baseUrl+"/sign-up/email", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    firstName, 
                    lastName, 
                    name, 
                    email, 
                    password, 
                    country, 
                    phoneNumber 
                })
            })

            if(res.ok) {
                this.successMessage = 'Registration successful! Please check your email to verify your account before logging in.'
                this.errorMessage = null
            } else {
                const data = await res.json()
                this.errorMessage = data.message || 'Registration failed'
                this.successMessage = null
            }
        },


        async logout(redirectTo = '/') {
            const res = await fetch(this.baseUrl+"/sign-out", {
                method: 'POST',
                credentials: 'include'
            })

            // Always redirect (even if API fails silently)
            window.location.href = redirectTo
        },


        async resendEmailVerification(email) {
            const res = await fetch(this.baseUrl+"/send-verification-email", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if(res.ok) {
                this.successMessage = 'If this email exists, a verification email has been resent. Please check your inbox.'
                this.errorMessage = null
            } else {
                const data = await res.json()
                this.errorMessage = data.message || 'Failed to resend verification email'
                this.successMessage = null
            }
        },

        async requestPasswordReset(email) {
            const res = await fetch(this.baseUrl+"/request-password-reset", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    redirectTo: `${window.location.origin}/auth?activeTab=reset-password`
                })
            })

            if(res.ok) {
                this.successMessage = 'If this email exists, a password reset link has been sent. Please check your inbox.'
                this.errorMessage = null
            } else {
                const data = await res.json()
                this.errorMessage = data.message || 'Failed to send password reset email'
                this.successMessage = null
            }
        },

        async resetPassword(token, newPassword) {
            const res = await fetch(this.baseUrl+"/reset-password", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            })

            if(res.ok) {
                this.successMessage = 'Your password has been reset successfully. You can now log in with your new password.'
                this.errorMessage = null
            } else {
                const data = await res.json()
                this.errorMessage = data.message || 'Failed to reset password'
                this.successMessage = null
            }
        },

        async changePassword(currentPassword, newPassword) {
            const res = await fetch(this.baseUrl+"/change-password", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions: true })
            })

            if(!res.ok) {
                const data = await res.json()
                this.errorMessage = data.message || 'Failed to change password'
                this.successMessage = null
            } else {
                // On success, logout user and redirect to auth page to re-login with new password
                await this.logout('/auth?activeTab=login&passwordChanged=true')
            }
        }
    })
})