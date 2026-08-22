# Skill: Consistent Chibi Pixel Avatar Image Generation

A practical guide for generating **clean, repeatable chibi pixel avatars** from real-person photos while preserving a consistent visual identity, composition, and export format across different subjects.

This skill is designed for workflows where you want multiple avatars to look like they belong to the **same set or series**, even when the source photos differ.

---

## Purpose

Use this skill when you want to transform a person from an uploaded image into a:

- **cute pixel avatar**
- **half-body chibi portrait**
- **clean white-background asset**
- **consistent club/team/member avatar**
- **sticker-like character** with optional corner icon or prop

This style is especially suitable for:

- committee/member introductions
- profile card assets
- social posts
- event graphics
- uniformed team portraits
- collectible member sets
- website character icons

---

## Core Style Identity

The target look should remain consistent across all outputs.

### Visual style
- **High-quality pixel art**
- **Chibi proportions**
- **Cute and friendly expression**
- **Modern polished pixel rendering**
- **Crisp pixel edges**
- **Clean silhouette**
- **Simple readable details**
- **No clutter**

### Character framing
- **Half body only**
- Character centered or slightly off-center if a corner icon is needed
- Large head proportion
- Small compact torso
- Soft cute pose
- Subject clearly isolated from the original background

### Background
- **Pure white background**
- No scene background
- No shadows unless very soft and minimal
- No decorative objects unless specifically requested
- No borders, frames, text, stickers, or extra elements unless specified

---

## Best Use Cases

Use this style when the user asks for things like:

- "extract the character and make a pixel avatar"
- "turn this person into a chibi pixel version"
- "make a clean white background avatar"
- "replicate the small cartoon character in the poster"
- "create matching avatars for all members"
- "same style as previous one"

---

## Input Analysis Rules

Before generating, inspect the source image and identify the following:

### 1. Face and expression
Capture:
- face shape
- hairstyle
- bangs/fringe
- glasses shape
- smile intensity
- eye friendliness
- any defining cute features

Do not overcomplicate realism. Simplify into pixel-readable features.

### 2. Clothing
Preserve key identity markers:
- shirt color
- collar color
- sleeve trim
- visible logos or badges
- vertical text on shirt if iconic and readable
- general uniform structure

Simplify tiny details into recognizable pixel symbols rather than realistic micro-detail.

### 3. Pose
If the user references a specific smaller figure in the image, use that figure as the pose reference.

Examples:
- waving with both hands
- saluting
- pointing
- peace sign
- hand-heart
- trumpet-holding pose
- hand-on-hip

If pose is unclear, default to:
- both hands visible
- cheerful welcoming pose
- stable symmetrical half-body composition

### 4. Accessories
Preserve important identity items:
- glasses
- tie
- hair ribbon
- badge
- instrument icon
- mascot symbol

Only include accessories the user explicitly wants, or that are strongly tied to the character identity.

---

## Style Specifications

### Proportions
Use chibi proportions:
- head takes about **55% to 65%** of total avatar height
- torso compact and simplified
- arms short and rounded
- hands simplified but expressive
- neck minimal or subtle

### Facial design
- big expressive eyes
- small simple nose or implied nose
- soft smile
- blush optional
- rounded cheeks
- glasses should be simplified and symmetrical

### Hair
- keep hair silhouette recognizable first
- use large clusters, not many thin strands
- preserve ponytail, fringe, middle part, side part, or tied-back shape
- readable at small size

### Pixel treatment
- crisp blocky rendering
- minimal anti-aliasing look
- edges should feel pixel-defined
- no painterly blending
- no vector-flat style
- no 3D shading
- shading should be simple and readable

---

## Composition Rules

### Standard avatar format
- **Aspect ratio**: square preferred
- **Subject**: centered
- **Crop**: half body
- **Background**: solid white
- **Padding**: enough breathing room around head and hands
- **No extra text**

### Corner-element format
When user asks for a small object or emoji in the corner:
- place it in the **top-right corner** by default unless another corner is requested
- keep it smaller than the face
- ensure it does not overlap the head
- style-match it to pixel art
- leave the rest of the background empty

Examples:
- trumpet emoji/icon
- star
- flower
- mascot
- heart
- club symbol

### Prop usage
If a prop is requested:
- it may appear in-hand or in a corner
- should not overpower the character
- must match the same pixel style
- should be isolated cleanly without other background elements

---

## Character Consistency Rules for Multiple Photos

When generating multiple avatars in one series, maintain consistency in:

- head-to-body ratio
- eye style
- skin tone treatment
- pixel density
- shading intensity
- outline thickness
- pose energy
- white background format
- corner icon scale
- clothing simplification logic

This is critical for team or committee sets.

### Keep consistent
- same canvas shape
- same visual weight
- same crop distance
- same rendering sharpness
- same charm level

### Avoid inconsistency
- one avatar looking realistic while another looks cartoon-flat
- one with thick outline and another with none
- different head proportions
- different background styles
- different lighting logic

---

## Prompt Construction Template

Use this general structure:

```markdown
Create a high-quality chibi pixel art avatar based on the uploaded person. 
Keep the character half-body only, centered, with a pure white background and no extra background objects.

Preserve the person’s key features:
- [hair description]
- [glasses or no glasses]
- [facial expression]
- [shirt/uniform colors]
- [visible badge/logo details]

Style requirements:
- cute chibi proportions
- crisp modern pixel art
- clean silhouette
- readable facial features
- simplified but recognizable clothing details
- polished pixel shading
- no text
- no border
- no scene background

Pose:
- [pose description]

Optional object:
- place a small pixel-art [object] at the top-right corner
- keep it separate from the character
- white background only
```

---

## Strong Prompt Keywords

These phrases help preserve the intended look:

### Positive style keywords
- high-quality pixel art
- clean pixel art
- crisp pixels
- modern pixel avatar
- cute chibi
- half-body chibi portrait
- polished pixel shading
- isolated on white background
- readable uniform details
- soft cheerful expression
- club-avatar style
- sticker-like character asset

### Identity keywords
- young Asian woman
- round glasses
- ponytail
- dark teal polo shirt
- white collar
- school or society logo
- friendly smile
- welcoming pose

### Layout keywords
- centered composition
- pure white background
- no additional elements
- corner icon only
- transparent-like clean isolation look

---

## Negative Prompt Guidance

Use strong exclusions to avoid style drift.

```markdown
blurry, smooth painting, semi-realistic, realistic portrait, watercolor, vector art, 3D render, glossy 3D, anime illustration, complex background, scenery, text, film strip, poster design, shadow-heavy scene, messy composition, too many props, full body, low resolution, anti-aliased smooth edges, noisy background, extra characters, deformed hands, broken glasses, malformed face
```

---

## Special Cases

## 1. When the user wants "only the avatar"
Requirements:
- white background only
- no text
- no decorative items
- no frame
- no original poster elements
- no scenery

## 2. When the user references a smaller cartoon version in the image
Interpret that smaller figure as the **pose and vibe reference**, not as the quality ceiling.
The final output should be:
- cleaner
- more polished
- more consistent
- higher quality pixel art

## 3. When a corner emoji/icon is requested
Convert the requested object into:
- cute pixel-art form
- matching palette and line sharpness
- small corner decoration
- clearly separate from the avatar

Examples:
- trumpet
- microphone
- book
- flower
- heart
- mascot

## 4. When logos are visible on clothing
Do not attempt tiny unreadable realism.
Instead:
- preserve logo placement
- preserve major color blocks
- preserve emblem feel
- simplify into pixel-friendly symbols

## 5. When multiple people from the same team are being processed
Re-use the same prompt structure and only swap:
- face traits
- hairstyle
- expression
- pose variation
- accessory/icon if needed

Everything else should stay stable for consistency.

---

## Recommended Output Format

### Default
- square image
- white background
- half body
- one character only

### Optional variations
- half-body with top-right prop
- half-body with transparent-looking clean isolation aesthetic
- matching series set for all members
- mascot version
- instrument-theme version

---

## Example Prompt 1: Clean Standard Avatar

```markdown
Create a high-quality cute chibi pixel avatar based on the uploaded girl. 
Use half-body composition only with a pure white background and no extra objects.

Preserve her key features:
- round glasses
- tied-back dark hair with soft loose strands
- cheerful smile
- dark teal collared uniform shirt with white collar
- simplified society badge on the chest

Style:
- crisp modern pixel art
- cute chibi proportions
- polished shading
- clean silhouette
- readable facial features
- simplified but recognizable uniform details

Pose:
- both hands raised in a friendly wave

No text, no poster elements, no border, no scenery, no extra decorations.
```

---

## Example Prompt 2: With Corner Instrument

```markdown
Create a high-quality cute chibi pixel avatar based on the uploaded girl.
Use half-body composition, pure white background, and no extra scene elements.

Keep these features:
- round glasses
- dark tied-back hair
- warm friendly smile
- dark teal polo shirt with white collar
- simplified badge on shirt

Style:
- crisp modern pixel art
- cute chibi proportions
- clean polished pixel shading
- readable details
- one-character composition only

Pose:
- friendly open-hand pose inspired by the smaller character in the reference image

Add a small pixel-art trumpet at the top-right corner.
Keep the trumpet separate from the character and match the same cute pixel style.
No other elements.
```

---

## Example Prompt 3: Series Consistency Version

```markdown
Generate a matching chibi pixel avatar in the same style as the previous member avatar.
Use a square canvas, pure white background, half-body crop, and consistent chibi proportions.

Maintain the same:
- pixel density
- face style
- eye scale
- shading intensity
- outline sharpness
- clothing simplification style
- overall cute club-avatar aesthetic

Only change the character-specific features based on the new photo:
- hairstyle
- glasses if present
- facial expression
- pose
- accessory if requested

No text, no frame, no scenery.
```

---

## Quality Checklist

Before finalizing, verify:

- character is clearly recognizable
- face looks cute, not uncanny
- glasses are symmetrical if present
- hair silhouette is identifiable
- uniform color is preserved
- logo placement feels correct
- pose is readable
- background is fully white
- no unwanted objects exist
- corner prop is clean and appropriately scaled
- overall result matches the existing series style

---

## Quick Reusable Mini Template

```markdown
Turn the uploaded person into a clean half-body chibi pixel avatar.
Pure white background, no scene, no text, no border.

Keep:
- recognizable hairstyle
- facial expression
- glasses/accessories
- uniform colors and badge placement

Style:
- high-quality modern pixel art
- cute chibi proportions
- crisp edges
- polished shading
- one character only

Pose:
- [insert pose]

Optional:
- add a small pixel-art [object] in the top-right corner

No extra elements.
```

---

## Final Notes

This skill works best when the request is specific about:
- pose source
- whether props are needed
- whether background must stay plain
- whether the output should match an existing avatar series

When consistency matters, prioritize:
1. recognizable silhouette  
2. stable chibi proportions  
3. clean white-background export  
4. matching pixel-art treatment across all members
