import { r as registerInstance, c as createEvent, h } from './index-CA13Qhmh.js';

const playerDetailCss = () => `.player-detail {   display: block; }  .player-header {   display: flex;   flex-direction: column;   align-items: center;   text-align: center;   gap: 20px;   padding: 32px;   background: rgba(0, 0, 0, 0.55);   border-radius: 16px;   margin: 16px; }  @media (min-width: 768px) {   .player-header {     flex-direction: row;     align-items: center;     text-align: left;   } }  .player-photo {   width: clamp(120px, 25vw, 220px);   height: clamp(120px, 25vw, 220px);   flex-shrink: 0; }  .player-photo img {   object-fit: cover;   width: 100%;   height: 100%; }  .avatar-placeholder-lg {   width: 100%;   height: 100%;   display: flex;   align-items: center;   justify-content: center;   background: rgba(0, 0, 0, 0.3);   border-radius: 50%;   font-size: clamp(3rem, 8vw, 6rem);   font-weight: 700;   color: rgba(255, 255, 255, 0.3); }  @media (min-width: 768px) {   .player-basic {     text-align: left;   } }  .player-basic h1 {   margin: 0 0 10px;   font-size: clamp(1.5rem, 4vw, 2.8rem);   font-weight: 800;   color: #fff; }  .player-basic .position, .player-basic .nationality {   color: rgba(255, 255, 255, 0.65);   margin: 5px 0;   font-size: clamp(0.95rem, 2vw, 1.4rem); }  .player-basic .team-league {   font-size: clamp(0.9rem, 1.8vw, 1.3rem);   color: var(--ion-color-tertiary, #60c000);   margin: 5px 0; }  .admin-buttons {   display: flex;   justify-content: center;   gap: 12px;   margin-top: 16px;   width: 100%; }  @media (min-width: 768px) {   .admin-buttons {     justify-content: flex-start;   } }  .admin-buttons ion-button {   flex: 1;   max-width: 200px;   --color: #fff; }  .player-physical {   display: flex;   flex-wrap: wrap;   justify-content: center;   gap: 20px;   margin-top: 16px;   padding-top: 16px;   border-top: 1px solid rgba(255, 255, 255, 0.15); }  @media (min-width: 768px) {   .player-physical {     justify-content: flex-start;   } }  .physical-item {   display: inline-flex;   align-items: center;   gap: 8px;   font-size: clamp(0.85rem, 1.5vw, 1.15rem);   color: rgba(255, 255, 255, 0.75); }  .physical-item ion-icon {   font-size: clamp(1rem, 1.8vw, 1.4rem);   color: var(--ion-color-tertiary, #60c000); }  .center-spinner {   display: flex;   justify-content: center;   padding: 32px; }  .spinner {   width: 32px;   height: 32px;   border: 3px solid var(--ion-color-light, #f4f5f8);   border-top-color: var(--ion-color-primary, #3880ff);   border-radius: 50%;   animation: spin 0.7s linear infinite; }  @keyframes spin {   to { transform: rotate(360deg); } }  .comments-wrapper {   display: flex;   flex-direction: column;   gap: 16px;    @media (min-width: 768px) {     flex-direction: row;      ion-card {       flex: 1;       min-width: 0;     }   } }  ion-card-title {   font-weight: 800;   font-size: clamp(1rem, 2vw, 1.3rem); }  .player-detail ion-card ion-item {   --background: transparent;   --border-color: rgba(255, 255, 255, 0.1);   --color: #fff; }  .player-detail ion-card ion-item ion-label {   color: #fff !important; }  .author-display {   margin: 12px 0;   font-size: clamp(0.95rem, 1.5vw, 1.1rem);   font-weight: 600;   color: #fff; }  .player-detail ion-card ion-item ion-input, .player-detail ion-card ion-item ion-textarea {   --color: #fff;   --placeholder-color: rgba(255, 255, 255, 0.5);   --padding-top: 6px; }  .comment-item {   --padding-start: 0;   --color: #fff; }  .comment-header {   display: flex;   align-items: center;   gap: 8px;   margin-bottom: 6px;   flex-wrap: wrap; }  .comment-header strong {   font-size: clamp(0.9rem, 1.5vw, 1.05rem);   color: #fff !important; }  .comment-meta {   font-size: clamp(0.65rem, 1vw, 0.8rem);   color: var(--ion-color-tertiary, #60c000);   white-space: nowrap; }  .comment-item ion-label .comment-text {   color: #fff !important;   margin: 10px 0 4px;   font-size: clamp(0.85rem, 1.4vw, 1rem);   line-height: 1.4; }  .comment-stars, .rating-input {   display: inline-flex;   gap: 2px; }  .rating-input {   margin-left: 16px; }  .star-btn {   cursor: pointer;   font-size: clamp(1.2rem, 2.5vw, 1.8rem);   color: var(--ion-color-medium, #92949c);   transition: color 0.15s; }  .star-btn:hover {   color: var(--ion-color-warning, #ffc409); }  .star-filled {   color: var(--ion-color-warning, #ffc409); }  .item-has-error {   --border-color: var(--ion-color-danger) !important; }  .field-error {   display: flex;   align-items: center;   gap: 4px;   font-size: 12px;   margin: 4px 0 8px 16px; } `;

const PlayerDetail = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.addComment = createEvent(this, "addComment");
        this.deleteComment = createEvent(this, "deleteComment");
        this.editPlayer = createEvent(this, "editPlayer");
        this.deletePlayer = createEvent(this, "deletePlayer");
        this.comments = [];
        this.isAdmin = false;
        this.loading = false;
        this.commentLoading = false;
        this.error = '';
        this.commentAuthor = '';
        this.commentText = '';
        this.commentRating = 3;
        this.hoverRating = 0;
        this.commentLocation = null;
        this.locationLoading = false;
        this.commentTextError = '';
        this.commentAuthorError = '';
    }
    get averageRating() {
        if (this.comments.length === 0)
            return 0;
        const sum = this.comments.reduce((a, c) => a + c.rating, 0);
        return Math.round((sum / this.comments.length) * 10) / 10;
    }
    get playerName() {
        const p = this.player;
        if (!p)
            return '';
        if (p.firstname && p.lastname)
            return `${p.firstname} ${p.lastname}`;
        return p.name;
    }
    stars(rating) {
        return Array.from({ length: 5 }, (_, i) => i + 1);
    }
    hasValidLocation(loc) {
        return !!loc && (loc.lat !== 0 || loc.lng !== 0);
    }
    mapsUrl(lat, lng) {
        return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    useCurrentLocation() {
        if (!navigator.geolocation)
            return;
        this.locationLoading = true;
        navigator.geolocation.getCurrentPosition((pos) => {
            this.commentLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };
            this.locationLoading = false;
        }, () => {
            this.locationLoading = false;
        });
    }
    handleSubmit(e) {
        e.preventDefault();
        this.commentTextError = '';
        this.commentAuthorError = '';
        const author = (this.loggedInUser || this.commentAuthor).trim();
        const text = this.commentText.trim();
        let valid = true;
        if (!author) {
            this.commentAuthorError = 'El nombre es obligatorio';
            valid = false;
        }
        if (!text) {
            this.commentTextError = 'El comentario no puede estar vacío';
            valid = false;
        }
        else if (text.length < 3) {
            this.commentTextError = 'El comentario debe tener al menos 3 caracteres';
            valid = false;
        }
        if (!valid)
            return;
        this.addComment.emit({
            author,
            text,
            rating: this.commentRating,
            location: this.commentLocation || undefined,
        });
        this.commentText = '';
        this.commentRating = 5;
        this.commentTextError = '';
        this.commentAuthorError = '';
    }
    handleDelete(commentId) {
        this.deleteComment.emit(commentId);
    }
    render() {
        var _a;
        const p = this.player;
        if (this.loading) {
            return (h("div", { class: "center-spinner" }, h("div", { class: "spinner" })));
        }
        if (!p)
            return null;
        return (h("div", { class: "player-detail" }, h("div", { class: "player-header" }, h("ion-avatar", { class: "player-photo" }, p.photo ? (h("img", { src: p.photo, alt: p.name })) : (h("div", { class: "avatar-placeholder-lg" }, p.name.charAt(0)))), h("div", { class: "player-basic" }, h("h1", null, this.playerName), p.position && h("p", { class: "position" }, p.position), (p.team || p.league) && (h("p", { class: "team-league" }, p.team, p.team && p.league && ' · ', p.league)), p.nationality && h("p", { class: "nationality" }, p.nationality), (p.birthDate || p.height || p.weight) && (h("div", { class: "player-physical" }, p.birthDate && (h("span", { class: "physical-item" }, h("ion-icon", { name: "calendar-outline" }), " ", p.birthDate)), p.height && (h("span", { class: "physical-item" }, h("ion-icon", { name: "resize-outline" }), " ", p.height, " cm")), p.weight && (h("span", { class: "physical-item" }, h("ion-icon", { name: "fitness-outline" }), " ", p.weight, " kg")))), this.isAdmin && (h("div", { class: "admin-buttons" }, h("ion-button", { expand: "block", fill: "solid", color: "tertiary", onClick: () => this.editPlayer.emit() }, h("ion-icon", { name: "create-outline", slot: "start" }), "Editar"), h("ion-button", { expand: "block", fill: "solid", color: "danger", onClick: () => this.deletePlayer.emit() }, h("ion-icon", { name: "trash-outline", slot: "start" }), "Eliminar"))))), this.hasValidLocation(p.location) && (h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, "Ubicaci\u00F3n")), h("ion-card-content", null, ((_a = p.location) === null || _a === void 0 ? void 0 : _a.address) && h("p", null, p.location.address), h("ion-button", { fill: "clear", color: "tertiary", href: this.mapsUrl(p.location.lat, p.location.lng), target: "_blank" }, h("ion-icon", { name: "map-outline", slot: "start" }), "Abrir en Google Maps")))), h("div", { class: "comments-wrapper" }, h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, "A\u00F1adir comentario")), h("ion-card-content", null, h("form", { onSubmit: (e) => this.handleSubmit(e) }, this.loggedInUser ? (h("ion-item", null, h("ion-label", null, "Tu nombre"), h("p", { class: "author-display" }, this.loggedInUser))) : (h("ion-item", { class: { 'item-has-error': !!this.commentAuthorError } }, h("ion-input", { label: "Tu nombre", labelPlacement: "floating", value: this.commentAuthor, onIonInput: (e) => {
                this.commentAuthor = e.target.value;
                this.commentAuthorError = '';
            }, required: true }))), !this.loggedInUser && this.commentAuthorError && (h("ion-note", { color: "danger", class: "field-error" }, this.commentAuthorError)), h("ion-item", { class: { 'item-has-error': !!this.commentTextError } }, h("ion-textarea", { label: "Comentario", labelPlacement: "floating", value: this.commentText, onIonInput: (e) => {
                this.commentText = e.target.value;
                this.commentTextError = '';
            }, rows: 3, maxlength: 1000, required: true })), this.commentTextError && (h("ion-note", { color: "danger", class: "field-error" }, this.commentTextError)), h("ion-item", null, h("ion-label", null, "Valoraci\u00F3n"), h("div", { class: "rating-input" }, this.stars(5).map((s) => (h("span", { class: { 'star-btn': true, 'star-filled': s <= (this.hoverRating || this.commentRating) }, onClick: () => (this.commentRating = s), onMouseEnter: () => (this.hoverRating = s), onMouseLeave: () => (this.hoverRating = 0) }, "\u2605"))))), h("ion-item", null, h("ion-label", null, "Ubicaci\u00F3n"), h("ion-button", { fill: "outline", size: "small", type: "button", color: "tertiary", disabled: this.locationLoading, onClick: () => this.useCurrentLocation() }, this.locationLoading ? (h("ion-spinner", { slot: "start" })) : (h("ion-icon", { name: "location-outline", slot: "start" })), this.locationLoading
            ? 'Obteniendo ubicación...'
            : this.commentLocation
                ? `${this.commentLocation.lat.toFixed(4)}, ${this.commentLocation.lng.toFixed(4)}`
                : 'Añadir ubicación')), (this.error) && (h("ion-note", { color: "danger", class: "ion-padding-top" }, this.error)), h("ion-button", { type: "submit", expand: "block", class: "ion-margin-top", disabled: (!this.loggedInUser && !this.commentAuthor.trim()) || !this.commentText.trim() || this.commentLoading }, this.commentLoading && h("ion-spinner", { slot: "start" }), "Publicar comentario")))), h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, "Comentarios")), h("ion-card-content", null, this.comments.length > 0 ? (h("ion-list", null, this.comments.map((c) => (h("ion-item", { class: "comment-item" }, h("ion-label", null, h("div", { class: "comment-header" }, h("strong", null, c.author), h("span", { class: "comment-stars" }, this.stars(c.rating).map((s) => (h("span", { class: { 'star-filled': s <= c.rating } }, "\u2605")))), h("span", { class: "comment-meta" }, new Date(c.createdAt).toLocaleString(), this.hasValidLocation(c.location) && (h("span", null, " \u00B7 ", c.location.lat.toFixed(4), ", ", c.location.lng.toFixed(4))))), h("p", { class: "comment-text" }, c.text)), this.isAdmin && (h("ion-button", { slot: "end", fill: "clear", color: "danger", size: "small", onClick: () => this.handleDelete(c._id) }, h("ion-icon", { name: "trash-outline" })))))))) : (h("ion-note", { class: "ion-padding-top" }, "No hay comentarios a\u00FAn. \u00A1S\u00E9 el primero en opinar!")))))));
    }
};
PlayerDetail.style = playerDetailCss();

export { PlayerDetail as player_detail };
