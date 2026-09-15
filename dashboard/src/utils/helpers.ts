

export function CropIcon(slug: string) {
    switch (slug) {
        case "rice":
            return "🌾"
        case "wheat":
            return "🌾"
        case "corn":
            return "🌽"
        case "cotton":
            return "☁️"
        case "potato":
            return "🥔"
        case "tomato":
            return "🍅"
        case "coffee":
            return "☕️"
        case "banana":
            return "🍌"
        case "chili":
            return "🌶️"
        case "tea":
            return "🌿"
        default:
            return "🌾"
    }
}
