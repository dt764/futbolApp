import { h } from "@stencil/core";
export class PlayerDetail {
    constructor() {
        this.comments = [];
        this.isAdmin = false;
        this.loading = false;
        this.commentLoading = false;
        this.error = '';
        this.commentAuthor = '';
        this.commentText = '';
        this.commentRating = 5;
        this.commentLocation = null;
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
        navigator.geolocation.getCurrentPosition((pos) => {
            this.commentLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };
        }, () => { });
    }
    handleSubmit(e) {
        e.preventDefault();
        const author = this.commentAuthor.trim();
        const text = this.commentText.trim();
        if (!author || !text)
            return;
        this.addComment.emit({
            author,
            text,
            rating: this.commentRating,
            location: this.commentLocation || undefined,
        });
        this.commentText = '';
        this.commentRating = 5;
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
        return (h("div", { class: "player-detail" }, h("div", { class: "player-header" }, h("ion-avatar", { class: "player-photo" }, p.photo ? (h("img", { src: p.photo, alt: p.name })) : (h("div", { class: "avatar-placeholder-lg" }, p.name.charAt(0)))), h("div", { class: "player-basic" }, h("h1", null, this.playerName), p.position && h("p", { class: "position" }, p.position), (p.team || p.league) && (h("p", { class: "team-league" }, p.team, p.team && p.league && ' · ', p.league)), p.nationality && h("p", { class: "nationality" }, p.nationality))), (p.birthDate || p.height || p.weight) && (h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, "Datos f\u00EDsicos")), h("ion-card-content", null, h("ion-list", null, p.birthDate && (h("ion-item", null, h("ion-label", null, "Fecha de nacimiento"), h("ion-note", { slot: "end" }, p.birthDate))), p.height && (h("ion-item", null, h("ion-label", null, "Altura"), h("ion-note", { slot: "end" }, p.height, " cm"))), p.weight && (h("ion-item", null, h("ion-label", null, "Peso"), h("ion-note", { slot: "end" }, p.weight, " kg"))))))), this.hasValidLocation(p.location) && (h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, "Ubicaci\u00F3n")), h("ion-card-content", null, ((_a = p.location) === null || _a === void 0 ? void 0 : _a.address) && h("p", null, p.location.address), h("ion-button", { fill: "clear", href: this.mapsUrl(p.location.lat, p.location.lng), target: "_blank" }, h("ion-icon", { name: "map-outline", slot: "start" }), "Abrir en Google Maps")))), h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, "Comentarios", this.comments.length > 0 && (h("ion-note", { class: "avg-rating" }, this.averageRating)))), h("ion-card-content", null, this.comments.length > 0 ? (h("ion-list", null, this.comments.map((c) => (h("ion-item", { class: "comment-item" }, h("ion-label", null, h("div", { class: "comment-header" }, h("strong", null, c.author), h("span", { class: "comment-stars" }, this.stars(c.rating).map((s) => (h("span", { class: { 'star-filled': s <= c.rating } }, "\u2605"))))), h("p", null, c.text), this.hasValidLocation(c.location) && (h("ion-button", { fill: "clear", size: "small", href: this.mapsUrl(c.location.lat, c.location.lng), target: "_blank" }, h("ion-icon", { name: "map-outline", slot: "start" }), c.location.lat, ", ", c.location.lng)), h("ion-note", null, new Date(c.createdAt).toLocaleString())), this.isAdmin && (h("ion-button", { slot: "end", fill: "clear", color: "danger", size: "small", onClick: () => this.handleDelete(c._id) }, h("ion-icon", { name: "trash-outline" })))))))) : (h("ion-note", { class: "ion-padding-top" }, "No hay comentarios a\u00FAn. \u00A1S\u00E9 el primero en opinar!")))), h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, "A\u00F1adir comentario")), h("ion-card-content", null, h("form", { onSubmit: (e) => this.handleSubmit(e) }, h("ion-item", null, h("ion-label", { position: "floating" }, "Tu nombre"), h("ion-input", { value: this.commentAuthor, onIonInput: (e) => (this.commentAuthor = e.target.value), required: true })), h("ion-item", null, h("ion-label", { position: "floating" }, "Comentario"), h("ion-textarea", { value: this.commentText, onIonInput: (e) => (this.commentText = e.target.value), rows: 3, maxlength: 1000, required: true })), h("ion-item", null, h("ion-label", null, "Valoraci\u00F3n"), h("div", { class: "rating-input" }, this.stars(5).map((s) => (h("span", { class: { 'star-btn': true, 'star-filled': s <= this.commentRating }, onClick: () => (this.commentRating = s) }, "\u2605"))))), h("ion-item", null, h("ion-label", null, "Ubicaci\u00F3n"), h("ion-button", { fill: "outline", size: "small", type: "button", onClick: () => this.useCurrentLocation() }, h("ion-icon", { name: "location-outline", slot: "start" }), this.commentLocation
            ? `${this.commentLocation.lat.toFixed(4)}, ${this.commentLocation.lng.toFixed(4)}`
            : 'Añadir ubicación')), (this.error) && (h("ion-note", { color: "danger", class: "ion-padding-top" }, this.error)), h("ion-button", { type: "submit", expand: "block", class: "ion-margin-top", disabled: !this.commentAuthor.trim() || !this.commentText.trim() || this.commentLoading }, this.commentLoading && h("ion-spinner", { slot: "start" }), "Publicar comentario"))))));
    }
    static get is() { return "player-detail"; }
    static get originalStyleUrls() {
        return {
            "$": ["player-detail.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["player-detail.css"]
        };
    }
    static get properties() {
        return {
            "player": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "Player | null",
                    "resolved": "Player | null | undefined",
                    "references": {
                        "Player": {
                            "location": "local",
                            "path": "C:/Users/detar/Universidad/Master/1\u00BA/DWEB-ProyFinal/futbolApp/stencil/src/components/player-detail/player-detail.tsx",
                            "id": "src/components/player-detail/player-detail.tsx::Player"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            },
            "comments": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "Comment[]",
                    "resolved": "Comment[]",
                    "references": {
                        "Comment": {
                            "location": "local",
                            "path": "C:/Users/detar/Universidad/Master/1\u00BA/DWEB-ProyFinal/futbolApp/stencil/src/components/player-detail/player-detail.tsx",
                            "id": "src/components/player-detail/player-detail.tsx::Comment"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "isAdmin": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "is-admin",
                "defaultValue": "false"
            },
            "loading": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "loading",
                "defaultValue": "false"
            },
            "commentLoading": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "comment-loading",
                "defaultValue": "false"
            },
            "error": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "error",
                "defaultValue": "''"
            }
        };
    }
    static get states() {
        return {
            "commentAuthor": {},
            "commentText": {},
            "commentRating": {},
            "commentLocation": {}
        };
    }
    static get events() {
        return [{
                "method": "addComment",
                "name": "addComment",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "{\n    author: string;\n    text: string;\n    rating: number;\n    location?: { lat: number; lng: number };\n  }",
                    "resolved": "{ author: string; text: string; rating: number; location?: { lat: number; lng: number; } | undefined; }",
                    "references": {}
                }
            }, {
                "method": "deleteComment",
                "name": "deleteComment",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                }
            }];
    }
}
