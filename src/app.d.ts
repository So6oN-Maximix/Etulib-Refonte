/// <reference types="@sveltejs/kit" />
import type { User, StudentProfile, ParentProfile, TutorProfile } from '@prisma/client';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
            user: (User & {
                student?: StudentProfile | null;
                parent?: ParentProfile | null;
                tutor?: TutorProfile | null;
				profileId: number | null | undefined
            }) | null;
        }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
