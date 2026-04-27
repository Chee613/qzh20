# Skill: Poster-to-Chibi Pixel Avatar Replication

A detailed reusable guide for generating **consistent chibi pixel avatars** from poster-style photos.

This skill is specifically designed for source images where:
- the **main large person** shows the subject identity and clothing details
- the **small character at the bottom-left** shows the pose or attitude to replicate
- a small **emoji/object icon** in the poster indicates the subject’s themed corner accessory
- the final output must be a **clean half-body chibi pixel avatar** on a **white background**

---

## Main Goal

Transform the person inside a poster into a **cute pixel avatar** with the following fixed output style:

- **extract the character only**
- **half-body chibi-style**
- **cute modern pixel art**
- **pure white background**
- **no extra decorations**
- **only one avatar**
- **one small themed emoji/object at the top-right corner**
- **pose should follow the small character at the bottom-left of the poster**
- **clothing and identity should follow the real main subject**

This workflow should be used consistently for other member photos so the entire set looks unified.

---

## Core Output Formula

Every final image should follow this formula:

**Main identity from the large subject**  
+  
**Pose/vibe from the small bottom-left character**  
+  
**One small object icon from the poster**  
+  
**White background only**  
+  
**Half-body cute pixel chibi style**

---

## Mandatory Visual Rules

These rules should always be followed unless the user explicitly requests otherwise.

### Character
- One character only
- No extra people
- No mascots
- No stickers
- No text
- No title
- No poster frame
- No film strip
- No scenery
- No shadows that look like a scene

### Background
- Pure white background
- No pattern
- No gradient scene
- No texture
- No objects around the avatar except the corner icon

### Framing
- Half-body only
- Character centered or slightly centered-left if needed to leave room for the icon
- Head and torso visible
- Hands visible if part of the pose
- Keep enough spacing so the top-right icon does not overlap the character

### Style
- Cute chibi proportions
- High-quality pixel art
- Clean and crisp pixels
- Modern polished pixel rendering
- Readable details
- Simplified but recognizable identity
- Soft, cheerful, collectible-avatar feeling

---

## Reference Interpretation Rules

When using the source poster, interpret the elements in this exact way:

### 1. Large main subject
Use the large subject for:
- face identity
- hairstyle
- hair color
- facial expression
- skin tone
- glasses if present
- uniform/clothing design
- logo/badge placement
- shirt color and collar structure

### 2. Small bottom-left character
Use the small character for:
- pose
- gesture
- body attitude
- hand position
- energy/vibe
- expression mood if useful

The small bottom-left character is the **pose reference**, not the identity source.

### 3. Poster emoji/object
Use the poster emoji/object as:
- a **small pixel-art icon**
- placed at the **top-right corner**
- separate from the avatar
- matching the same pixel-art style

Examples:
- trumpet
- ginger
- any small symbol shown in the name plate or poster section

The object should **not** become a large prop unless the user explicitly asks.  
By default it should remain a **small corner icon**.

---

## Style Identity

To keep all generated avatars consistent across different people, the style should always include the following:

### Character proportions
- Head is large and cute
- Body is compact
- Arms simplified
- Hands readable but not realistic
- Neck minimal
- Chibi ratio should feel balanced and adorable

### Face style
- Big expressive eyes
- Soft smile
- Small nose or implied nose
- Rounded face
- Cute blush is optional
- Facial details should remain clean and readable in pixel form

### Hair style treatment
- Preserve recognizable hair shape
- Use simplified locks and silhouette
- Keep bangs, ponytail, long hair, tied hair, or parting style recognizable
- Avoid over-rendering single strands
- Prioritize silhouette accuracy over realism

### Clothing treatment
- Preserve main shirt color
- Preserve collar color
- Preserve sleeve trim if visible
- Preserve main badge/logo placement
- Simplify tiny print details into recognizable pixel-friendly shapes

### Pixel rendering treatment
- Crisp edges
- Defined pixel blocks
- No painterly blur
- No watercolor look
- No smooth vector look
- No 3D rendering
- No photoreal shading
- Shading should be simple, polished, and pixel-readable

---

## Composition Rules

### Standard layout
- Square canvas preferred
- Half-body crop
- White background
- Character takes most of the visual attention
- Corner icon at the top-right
- No other elements

### Corner icon placement
The object icon should:
- always be placed in the **top-right corner**
- remain small
- not overlap the head
- not dominate the image
- be clearly readable
- match the avatar’s pixel style

### Pose rule
Always remember:

> **Use the small character at the bottom-left as the pose reference.**

This is one of the most important rules in this skill.

Examples:
- if the small character is waving, use a waving pose
- if the small character is saluting, use a saluting pose
- if the small character has one hand on hip, preserve that attitude
- if the small character has a cheerful open-arm pose, replicate that feeling

---

## Permanent Instruction Set

This is the stable instruction set to repeat for all similar images:

1. Extract the character from the poster.
2. Use the **main large person** as the identity source.
3. Use the **small character at the bottom-left** as the pose reference.
4. Turn the person into a **cute half-body chibi pixel avatar**.
5. Use a **pure white background**.
6. Keep **no other stuff around**, except one small object icon.
7. Use the **emoji/object shown in the poster**.
8. Put the object icon at the **top-right corner**.
9. Make the icon match the same cute pixel-art style.
10. Preserve clothing color and key badge/logo placement.
11. Keep the final output clean, simple, and consistent with the series.

---

## Recommended Prompt Template

Use this template when generating:

```markdown
Extract the character from the poster and create a cute half-body chibi pixel avatar.

Reference usage:
- Use the large main subject as the identity reference for the face, hairstyle, expression, clothing, and uniform details.
- Use the small character at the bottom-left as the pose reference and replicate that pose/vibe.
- Use the emoji/object shown in the poster as a small pixel-art icon.

Output requirements:
- one character only
- half-body chibi style
- high-quality modern pixel art
- pure white background
- no extra decorations
- no text
- no border
- no poster elements
- no scenery

Character requirements:
- preserve the person’s recognizable hairstyle
- preserve facial expression
- preserve glasses if present
- preserve shirt color, white collar, sleeve details, and badge/logo placement
- simplify fine details into clean readable pixel art

Object icon:
- create a small pixel-art [OBJECT]
- place it at the top-right corner
- keep it separate from the avatar
- make sure it does not overlap the character
- keep it small and decorative only

Important:
Always use the small character at the bottom-left as the pose reference.
```

---

## Expanded Master Prompt Template

Use this version when you want stricter control:

```markdown
Create a clean, cute, high-quality chibi pixel avatar based on the uploaded poster.

Interpret the poster as follows:
- The large main person is the identity reference.
- The small character at the bottom-left is the pose reference.
- The small emoji/object in the poster is the themed object reference.

Generate:
- one half-body chibi character only
- pure white background
- no extra objects except the themed corner icon
- no text
- no frame
- no film strip
- no scenery
- no shadows suggesting a background scene

Style:
- crisp modern pixel art
- cute chibi proportions
- polished but simple shading
- clean silhouette
- readable facial features
- readable hands
- simplified but recognizable uniform details

Preserve:
- hair shape and hairstyle
- face identity
- glasses if visible
- expression
- shirt color
- white collar
- badge/logo placement
- general uniform appearance

Pose:
- replicate the pose from the small character at the bottom-left

Corner icon:
- create a small pixel-art [OBJECT]
- place it at the top-right corner
- keep it detached from the character
- keep it small and visually balanced

Final output should look like a collectible series avatar.
```

---

## Prompt Example 1: Trumpet Version

```markdown
Extract the character from the poster and create a cute half-body chibi pixel avatar.

Use the large main subject as the identity reference for the face, hairstyle, expression, and uniform.
Use the small character at the bottom-left as the pose reference.
Create a small pixel-art trumpet based on the poster emoji and place it at the top-right corner.

Requirements:
- one avatar only
- half-body chibi style
- high-quality crisp pixel art
- pure white background
- no text
- no border
- no poster elements
- no scenery
- no extra decorations

Preserve:
- glasses if present
- dark teal shirt
- white collar
- chest badge/logo placement
- cheerful friendly expression

Important:
Always replicate the pose from the small bottom-left character.
```

---

## Prompt Example 2: Ginger Version

```markdown
Extract the character from the poster and create a cute half-body chibi pixel avatar.

Use the large main subject as the identity reference for face, hair, clothing, and expression.
Use the small character at the bottom-left as the pose reference and replicate that saluting/hand-on-hip pose.
Use the ginger emoji shown in the poster as the corner icon.

Requirements:
- one half-body avatar only
- cute chibi style
- clean modern pixel art
- pure white background
- no extra stuff around the avatar
- no text
- no frame
- no scenery

Character details:
- preserve long dark hair
- preserve facial expression
- preserve shirt color and white collar
- preserve the chest badge/logo in simplified pixel form

Object icon:
- create a small pixel-art ginger icon
- place it at the top-right corner
- keep it slightly away from the head
- keep it small and decorative

Important:
Always use the small character at the bottom-left as the reference for the pose.
```

---

## Series Consistency Prompt

Use this when generating many member avatars:

```markdown
Generate a matching chibi pixel avatar in the same style as the previous series.

Rules:
- use the large subject as identity reference
- use the small character at the bottom-left as pose reference
- use the poster emoji/object as a top-right corner icon
- half-body only
- pure white background
- one avatar only
- high-quality modern pixel art
- cute chibi proportions
- no text
- no frame
- no scenery

Keep consistent across all members:
- same pixel rendering quality
- same white background format
- same chibi proportions
- same icon placement
- same shading intensity
- same framing distance
- same clean collectible-avatar style
```

---

## Strong Positive Keywords

These keywords help enforce the correct style:

- high-quality pixel art
- clean pixel art
- crisp pixels
- modern pixel avatar
- cute chibi
- half-body chibi portrait
- collectible avatar
- pure white background
- isolated character
- one character only
- polished pixel shading
- simplified but recognizable
- cute member avatar
- clean silhouette
- top-right corner icon
- pose based on bottom-left figure

---

## Strong Negative Prompt

Use these to prevent style drift:

```markdown
realistic, semi-realistic, painterly, watercolor, vector art, 3d render, anime poster, full body, multiple characters, scene background, poster background, text, frame, film strip, scenery, clutter, extra props, messy layout, low resolution, blurry, soft airbrush, smooth non-pixel shading, over-detailed realism, deformed hands, distorted face, large accessory, corner icon overlapping head
```

---

## Quality Control Checklist

Before finalizing, check all of the following:

### Identity
- Does the avatar resemble the main large subject?
- Is the hairstyle recognizable?
- Are glasses preserved if present?
- Is the expression appropriate?

### Pose
- Did the pose come from the small bottom-left character?
- Is the gesture readable?
- Is the body attitude correct?

### Style
- Is the result clearly pixel art?
- Is the character clearly chibi?
- Is the rendering cute and consistent?
- Is the silhouette clean?

### Layout
- Is the background pure white?
- Is there only one avatar?
- Are there no poster elements left?
- Is the icon at the top-right corner?
- Is the icon small and separate from the character?

### Clothing
- Is the shirt color preserved?
- Is the collar preserved?
- Is the logo/badge placement preserved in simplified form?

---

## Common Mistakes to Avoid

Do **not** do these:

- using the main subject’s pose instead of the small bottom-left pose
- putting the icon in the wrong corner
- making the icon too large
- keeping poster background or frame
- generating full-body instead of half-body
- adding extra decorative elements
- making the style too realistic
- removing important identity markers like glasses or hairstyle
- changing the uniform color
- forgetting the white background rule

---

## Short Reusable Rule Summary

Use this quick summary whenever needed:

```markdown
Extract the character from the poster. Use the large subject as the identity reference and the small bottom-left character as the pose reference. Create a cute half-body chibi pixel avatar on a pure white background with no extra objects. Use the emoji/object shown in the poster as a small pixel-art icon placed at the top-right corner. Preserve the hairstyle, expression, clothing color, collar, and badge placement. One avatar only. No text, no frame, no scenery.
```

---

## Final Golden Rule

The style can be summarized in one sentence:

> **Main subject for identity, bottom-left mini character for pose, poster emoji for top-right icon, all rendered as a clean half-body chibi pixel avatar on a white background.**
