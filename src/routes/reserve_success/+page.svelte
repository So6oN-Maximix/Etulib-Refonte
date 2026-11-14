<section class="auth seyes" style="padding: 1rem 0; width: 100%; min-height: auto;">
    <div class="container" style="display: flex; justify-content: center;">
        
        <div class="auth-card" style="text-align: center; max-width: 480px; width: 100%; padding: 1.5rem 1.75rem;">
            
            <div style="width: 64px; height: 64px; background: #2e7d4f; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; box-shadow: 0 4px 12px rgba(46, 125, 79, 0.25);">
                <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width: 32px; height: 32px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
                </svg>
            </div>

            <h1 style="font-size: 1.75rem; margin-bottom: 0.35rem;">Réservation confirmée !</h1>
            <p style="color: var(--muted); margin-bottom: 1rem; font-size: 0.95rem;">Félicitations, votre cours a bien été réservé. Un e-mail récapitulatif a été envoyé sur votre adresse.</p>

            <div class="tinted" style="padding: 0.85rem 1rem; border-radius: 6px; margin-bottom: 1.25rem; text-align: left; font-size: 0.9rem;">
                <ul style="list-style: none;">
                    <li style="display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px solid var(--line);" id="tutor">
                        <span style="color: var(--muted);">Professeur :</span> 
                        <b style="color: var(--ink);" id="success-tutor-name">Camille M.</b>
                    </li>
                    <li style="display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px solid var(--line);" id="subject">
                        <span style="color: var(--muted);">Matière :</span> 
                        <b style="color: var(--ink);" id="success-course">Mathématiques</b>
                    </li>
                    <li style="display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px solid var(--line);" id="date">
                        <span style="color: var(--muted);">Date :</span> 
                        <b style="color: var(--ink);" id="success-date">Jeu. 29 oct. à 15h30</b>
                    </li>
                    <li style="display: flex; justify-content: space-between; padding: 0.35rem 0;" id="duration">
                        <span style="color: var(--muted);">Durée :</span> 
                        <b style="color: var(--ink);" id="success-duration">1 h 30</b>
                    </li>
                </ul>
            </div>

            <div class="form-actions" style="justify-content: center; flex-wrap: wrap; gap: 0.75rem;">
                <a href="/dashboard-student" class="btn-search" style="padding: 0.7rem 1.4rem;">Voir mon agenda</a>
                <a href="/" class="btn-line" style="padding: 0.7rem 1.4rem;">Retour à l'accueil</a>
            </div>
        </div>
    </div>
</section>

<style>
    @import "#lib/styles/auth.css";
</style>