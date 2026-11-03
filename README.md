# Brea Hunter: website

A one-page portfolio site for Brea Hunter, interior designer, decorator and creative director ([@brea_hunter](https://www.instagram.com/brea_hunter/)). Plain HTML, CSS and JavaScript with no build step, so it runs on GitHub Pages as-is.

Preview: https://jdix22.github.io/brea-hunter/

## Highlights
- **Brand mark:** an arched doorway with a small brass glint (her arched mirrors and the ✨ in her Instagram name), set beside a spaced serif wordmark. The large italic "Brea Hunter" signature with the glint is used in the hero and footer.
- **Sketch-to-finished sliders:** every room has a pencil concept drawing (made from the photo) that wipes away to reveal the finished room. The hero plays the reveal once on load; the five room studies give a small nudge the first time they're seen. Drag, swipe, tap, or use the arrow keys.
- **Palette chips:** each study shows six colours pulled from the finished photo, with names. Tap a chip to copy its hex code.
- **Design notes:** four of Brea's own opinions, quoted from her Instagram captions, each linking to the post.
- **Instagram feed:** eight of her posts, picked to avoid text overlays and her face-to-camera reels. Captions appear on hover on desktop only.
- **Enquiry form:** project type, rooms, timing and a message.
- Set to `noindex` until Brea approves it and it moves to her own domain.

## Before going live: things to confirm with Brea
1. **Room study photos are placeholders.** The five studies, the hero room and the service images are free Unsplash photos (licence allows commercial use) that match her style. Her Instagram is mostly Pinterest saves and reels, not her own projects, so none of those are presented as her work. Swap in her real project photos: put a landscape photo in `assets/img/`, then run the sketch filter (see below) to make its concept drawing.
2. **Email for enquiries.** Not published anywhere public. Until `CONTACT_EMAIL` (or `FORM_ENDPOINT`) is set in `assets/site.js`, the form copies the visitor's note and opens an Instagram DM to @brea_hunter.
3. **Where she works.** Her bio says "PA" and one post tags #nycinteriordesign. Confirm city/region and whether she works remotely, then add it to the hero line, footer and the JSON-LD (`areaServed`).
4. **Services and process.** The four services and four steps are written from her bio ("Interior Design | Decor | Creative Direction") and captions (she calls sourcing lighting a favourite). Check she offers each, and whether she wants pricing, packages or a consultation fee shown.
5. **A headshot.** Her Instagram profile photo is only 150px. A proper portrait would make a strong About section.
6. **Brand name.** The site uses "Brea Hunter" for now. If she picks a studio name, change the wordmark text in `index.html` (header, hero, footer), the title/meta tags and the JSON-LD.

## Editing
- **Instagram feed:** the eight saved posts are in `index.html` (section `#journal`), images in `assets/img/ig/`. To show her latest posts automatically, create a free feed at behold.so and paste its ID into `BEHOLD_FEED_ID` in `assets/site.js`. Reels are skipped automatically (their covers carry caption text); add any post ID to `IG_HIDE` to keep it off the site.
- **Room studies:** each `<article class="study">` in `index.html` holds the slider images, the notes and the palette. `data-tint` is the colour the section background drifts towards.
- **Colours and fonts:** CSS variables at the top of `assets/site.css`. Fonts are Noto Serif Display and Geist (Google Fonts).
- **Cache:** bump the `?v=` number on `site.css` and `site.js` in `index.html` after edits.

## Making a concept sketch from a photo
The sketches come from an ffmpeg filter (pencil shading from a colour-dodge blend plus fine ink edges, tinted to warm paper):

```
ffmpeg -i room.jpg -filter_complex "[0]scale=1800:-2,format=gray,split=3[a][b][e];[b]negate,gblur=sigma=7[c];[a][c]blend=all_mode=dodge,curves=all='0/0 0.5/0.22 0.8/0.7 0.93/0.95 1/1'[p];[e]gblur=sigma=1.1,edgedetect=low=0.05:high=0.15:mode=wires,negate,gblur=sigma=0.6[l];[p][l]blend=all_mode=multiply,format=rgb24,colorchannelmixer=rr=0.975:gg=0.95:bb=0.895:gb=0" -c:v libwebp -quality 78 room-sketch.webp
```

## Photo credits
Unsplash photo IDs (all under the Unsplash licence): hero 1680770638423, living 1728649060658, bath 1676371855313, kitchen 1684928365167, bedroom 1653974123568, sitting room 1757792859308, alcove 1758024836397, vases 1677761640321, pendants 1540932239986, material board 1601464723270, desk 1770970831074, fabrics 1708024975443, arch room 1567016376408. Instagram images are Brea's posts, linked back to the originals.

## Files
- `index.html`: the whole site
- `assets/site.css`, `assets/site.js`: styles and interactions
- `assets/img/`: photos and sketches (WebP); `assets/img/ig/`: Instagram tiles
- `assets/og.png`: social share card (source: `_src/og-card.html`)
- `404.html`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `apple-touch-icon.png`
