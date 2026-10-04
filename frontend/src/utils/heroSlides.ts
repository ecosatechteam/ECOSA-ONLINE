const heroSlideAssets = import.meta.glob('../assets/hero-slides/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const builtInHeroSlides = Object.entries(heroSlideAssets)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([path, imageUrl]) => {
    const filename = path.split('/').pop() || 'hero-photo'
    const name = filename.replace(/\.[^.]+$/, '')
    return {
      id: `builtin-${name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`,
      name: `${name} (built-in)`,
      imageUrl: new URL(imageUrl, window.location.origin).href,
      source: 'builtin' as const,
    }
  })
