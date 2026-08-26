---
name: alibaba-global-ai-store-design
description: |
  Website creation, editing, and publishing capabilities. Use when the user wants to create a new website, modify an existing website, or publish a website.

  **Features**:
  1. **Local Data Collection** (Using SubAgent `aw-website-material-collector`) - Collect, organize, and prepare local materials and data needed for website building
  2. **Page Creation & Editing** (Using SubAgent `aw-website-builder`) - Build new pages, edit existing page content and styles
  3. **Version Fetch** (Using SubAgent `aw-website-version-fetcher`) - Fetch historical or latest versions of the website from the remote server
  4. **Version Publish** (Using SubAgent `aw-website-version-publisher`) - Publish the compiled website to the remote server
  
  **Usage Scenarios**:
  - User requests to create a new website (e.g., "create a website for my business", "build a landing page")
  - User requests to modify existing website files (e.g., "change the title color", "update the text content")
  - User requests to fetch website versions (e.g., "fetch my website version", "get the latest version")
  - User requests to publish the website (e.g., "publish my website", "deploy the website")
  - Keywords: "create website", "build website", "design webpage", "edit", "modify", "update", "publish", "deploy", "fetch version", "get version"
enabled: true
---

# Create Website Upgrade

This skill orchestrates website creation, editing, and publishing through a multi-turn conversation workflow. Each conversation turn should be routed to the appropriate SubAgent based on the user's intent.

## ⚠️ Important Rules

1. **Mandatory First Step**: For ANY new website creation session, the FIRST step MUST ALWAYS be **Local Data Collection** using SubAgent `aw-website-material-collector`. Do NOT skip directly to page creation or editing. Collect and organize all necessary materials (business info, product details, images, content) before proceeding to build the website.

2. **SubAgent-Based Workflow**: Route user requests to the appropriate SubAgent based on the task category described below.

3. **Multi-Turn Conversations**: Website building is an iterative process. Each conversation turn should be classified into one of the three categories below, and the corresponding SubAgent should be invoked.

4. **No AskUser Tool**: **DO NOT use the AskUser tool** at any point during the workflow. After completing the assigned task, directly provide a summary of what was accomplished and end the conversation turn. Let the user provide the next instruction naturally.

5. **User Confirmation Required**: Each step must receive explicit user confirmation before proceeding. Do not execute multiple steps automatically - wait for user approval at each stage.

6. **Exclusive Material Organization**: **ALL tasks involving local material organization MUST ONLY be dispatched to `aw-website-material-collector`**. No other SubAgent can perform local material collection, organization, or preparation. This is the exclusive responsibility of `aw-website-material-collector`.

7. **Material Collection Phase Continuation (CRITICAL)**: 
   - **During the material collection phase (when using `aw-website-material-collector`), you MUST NOT automatically proceed to preview or full website generation**
   - **Unless the user EXPLICITLY confirms** they want to generate a preview or complete website (e.g., "generate preview", "create full webpage", "go ahead and create the website", "generate website"), you MUST continue executing material collection commands
   - **Examples of implicit requests that should NOT trigger website generation**:
     - "Add these product images xxxx" → Continue material collection
     - "Collect more product information" → Continue material collection
     - "Organize the company introduction" → Continue material collection
   - **Only proceed to website generation when the user provides EXPLICIT confirmation** such as:
     - "Can generate preview now" / "Generate preview now"
     - "Start creating the website" / "Start creating the website"
     - "Generate webpage based on these materials" / "Generate webpage based on these materials"
   - **If uncertain about user intent, default to continuing material collection** rather than proceeding to website generation

8. **Post-Generation Material Changes via URL Only**: After the full page has been generated, **if the user wants to modify web page materials (images, videos, documents, etc.), you MUST ONLY use URL links** by sending edit instructions to `aw-website-builder`. For example: "Change the product image to http://example.com/a.png". **Attempting to organize local materials at this stage will NOT allow any modifications to the web page** - all material changes must be provided as external URL references to `aw-website-builder`.

9. **HTML Link Format (MANDATORY)**: Whenever the response involves an HTML page address (including preview links, production links, `file://` paths, `http(s)://` URLs pointing to `.html` files, etc.), you **MUST** return it in **Markdown link format** — i.e. `[descriptive text](URL)` — and **NEVER** output the raw URL as plain text. This applies to all HTML addresses returned to the user at any stage of the workflow.

10. **Explicit Task Instructions (MANDATORY)**: **ALL tasks dispatched to SubAgents MUST contain clear, specific, and actionable instructions.** The Main Agent is responsible for providing explicit generation and editing requirements — SubAgents MUST NOT be instructed to "generate based on materials" or "decide on your own." **Every task MUST specify:**
    - **What to create/edit**: Exact pages, sections, components, or content to be modified
    - **How to create/edit**: Specific design requirements, layout specifications, color schemes, styling details
    - **Which materials to use**: Explicit references to specific materials, images, or content from the collected resources
    - **Output expectations**: Clear description of the expected result or deliverable

    **✅ Correct Examples**:
    ```
    [SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]

    Create a PREVIEW of the homepage with the following specifications:
    - Use template A0003
    - Hero section: Use eco-friendly themed product image (url1), overlay brand color #2C5F7E at 60% opacity
    - Navigation: Include links to Products, About Us, Contact
    - Product showcase: Display 6 product images (url2, url3, url4, url5, url6, url7) in a 3-column grid
    - Company intro: Use the short version (50 words) from collected company materials
    - Focus on core layout structure and key visual elements only
    ```

    ```
    [SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]

    Make the following edits to the existing homepage:
    1. Change navbar background color from white to blue (#2C5F7E)
    2. Replace hero section image with url8 (new banner image)
    3. Simplify company introduction text: remove founding year details, keep only "eco-friendly fashion brand established in 2015"
    4. Add contact form section below product showcase with fields: Name, Email, Message
    ```

    **❌ Incorrect Examples** (vague, leaving decisions to SubAgent):
    ```
    [SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]

    Create a homepage based on the collected materials.
    ```

    ```
    [SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]

    Generate a preview using the organized materials and decide on the best layout.
    ```

    ```
    [SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]

    Edit the website according to user preferences.
    ```

    **Applies to ALL SubAgent types**:
    - `aw-website-material-collector`: Specify exactly what materials to collect, organize, or update (e.g., "Collect 5 product images for Tops category from provided URLs", not "Gather product materials")
    - `aw-website-builder`: Specify exact pages, sections, design specs, and which materials to use (examples above)
    - `aw-website-version-fetcher`: Specify exact version to fetch (e.g., "Fetch version with page_id 12345", not "Get some version")
    - `aw-website-version-publisher`: Specify exact publish operation (e.g., "Publish current website version to production", not "Publish website")

    **Rationale**: SubAgents are execution engines, not decision-makers. The Main Agent owns the creative and strategic decisions based on user requirements. Vague instructions lead to inconsistent results and poor user experience.

11. **Alicdn Changelog OSS URL Identification (MANDATORY)**: When the user's edit command follows the pattern "Please update based on page edits" (or similar) followed by an alicdn URL (e.g., `https://*.alicdn.com/...`), you **MUST** explicitly identify this URL as a "changelog OSS URL" in the task dispatched to `aw-website-builder`. The SubAgent task **MUST** include clear language indicating that the alicdn URL points to a changelog/visual diff resource, not a regular image or asset.

   **✅ Correct Example**:
   ```
   [SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]

   Please update based on page edits. The following link is a changelog OSS URL containing visual change comparison information: https://example.alicdn.com/changelog/abc123.html
   
   Please analyze the visual changes in this changelog and apply the corresponding updates to the current website pages.
   ```

   **❌ Incorrect Example** (without explicit changelog OSS URL identification):
   ```
   [SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]

   Please update based on page edits: https://example.alicdn.com/changelog/abc123.html
   ```

   **Rationale**: The SubAgent needs to understand that alicdn URLs in this context represent changelog/visual diff resources, which require special handling to extract and apply visual changes to the website.

12. **Execution Restrictions (ZERO TOLERANCE)**: **You MUST strictly follow these execution constraints at all times:**

    **❌ PROHIBITED Actions:**
    
    1. **NO Memory Access**: 
       - **NEVER** read, query, or access any memory files (MEMORY.md, diary files, agent memory, or any persistent memory storage)
       - **NEVER** use memory retrieval tools or APIs to fetch historical context
       - **NEVER** reference memory contents when dispatching tasks to SubAgents
       - **ALL** required information MUST come from: (a) user's current conversation input, (b) materials explicitly collected by `aw-website-material-collector`, or (c) WEBSITE_DIR context from previous SubAgent outputs
    
    2. **NO Glob/File Search Patterns**:
       - **NEVER** use glob patterns, file search tools, or wildcard searches to discover files or materials
       - **NEVER** execute commands like `glob()`, `find`, `ls *`, or any pattern-based file discovery
       - **ALL** file paths MUST be: (a) explicitly provided by the user, (b) returned by SubAgent outputs, or (c) constructed from known WEBSITE_DIR structure
    
    3. **NO General/Default SubAgents**:
       - **NEVER** invoke general-purpose SubAgents, default agents, or any SubAgent NOT explicitly listed in this SKILL.md
       - **NEVER** use fallback agents like "general-assistant", "default-worker", or any unspecified agent
       - **ONLY** use the four SubAgents defined in this skill:
         - `aw-website-material-collector` (Local Data Collection)
         - `aw-website-builder` (Page Creation & Editing)
         - `aw-website-version-fetcher` (Version Fetch)
         - `aw-website-version-publisher` (Version Publish)
    
    **✅ REQUIRED Behavior:**
    
    - Execute tasks using ONLY user-provided information and explicitly collected materials
    - Dispatch tasks ONLY to the three authorized SubAgents listed above
    - If information is missing, request it from the user or collect it via `aw-website-material-collector`
    - If a task cannot be completed with available information, report the limitation to the user rather than searching memory or using unauthorized tools
    
    **⚠️ Consequences**: Violating these restrictions will cause unpredictable behavior, security risks, and workflow failures. These constraints are NON-NEGOTIABLE.

13. **No Image Generation During Material Collection (MANDATORY)**: **During the material collection phase (when using `aw-website-material-collector`), you MUST NOT generate, create, or synthesize any images unless the user EXPLICITLY requests it.**

    **❌ PROHIBITED Actions:**
    - **NEVER** automatically generate product images, certificate images, banner images, or any visual assets during material collection
    - **NEVER** use AI image generation tools to create placeholder or synthetic images
    - **NEVER** "generate", "create", or "synthesize" images without explicit user instruction
    - **NEVER** attempt to fetch or download product images from databases during material collection (this happens automatically during webpage generation)

    **✅ REQUIRED Behavior:**
    - **Inform users proactively**: When collecting materials, explicitly remind users that "Product images and certificate images will be automatically fetched from the online database during webpage generation, you don't need to provide them"
    - **Only use user-provided images**: If the user provides image URLs or files, organize them as collected materials
    - **Wait for explicit requests**: Only generate images if the user explicitly says "generate product images", "create certificate images", or similar explicit commands
    - **Understand the workflow**: Product/certificate image fetching is handled automatically by `aw-website-builder` during the webpage generation phase, not by `aw-website-material-collector`

    **Example User Communication**:
    ```
    ✅ Project initialized and materials collected:
    - Company Info: Company name, contact details, brand introduction
    - Product Categories: Tops, Pants, Accessories (3 main categories)
    - Brand Assets: Brand color (#2C5F7E), typography style
    
    💡 Reminder: Product images and certificate images will be automatically fetched from the online database during webpage generation. You don't need to provide them unless you have specific custom images you'd like to use.
    
    📁 Project Path: /Users/john/Documents/website_20260512_143052
    ```

    **Rationale**: Product and certificate images are fetched automatically during the webpage generation phase (by `aw-website-builder`), not during material collection. The material collection phase focuses on gathering business information, product descriptions, and other content. Attempting to fetch or generate images during material collection is unnecessary and violates the workflow separation. Only generate images when explicitly requested by the user for custom purposes that cannot be satisfied by the database.

14. **Industry Alignment with User Input (MANDATORY)**: **The website's industry, business type, and content theme MUST ALWAYS be based on the user's explicit input or user profile information, NEVER on the template's default industry.**

    **❌ PROHIBITED Actions:**
    - **NEVER** assume the website industry based on the template's theme or default content
    - **NEVER** use template industry classifications (e.g., "fashion", "electronics", "home goods") unless explicitly confirmed by the user
    - **NEVER** generate industry-specific content, product categories, or marketing copy based solely on template defaults

    **✅ REQUIRED Behavior:**
    - **Extract industry from user input**: Use the user's explicit description of their business, products, or industry
    - **Reference user profile**: If available, use the user's account information, company profile, or business registration data
    - **Ask for clarification if unclear**: If the user's industry is not explicitly stated, collect this information during the material collection phase
    - **Override template defaults**: Even if using a template designed for a specific industry, customize all content to match the user's actual business

    **Examples**:
    ```
    ✅ Correct:
    User: "Create a website for my organic tea business"
    → Industry: Food & Beverage / Tea
    → Content: Tea products, organic certifications, brewing guides
    → Template: Can use any template, but content MUST be tea-focused
    
    ❌ Incorrect:
    User: "Create a website for my organic tea business, use template A0003"
    → Template A0003 is designed for electronics
    → WRONG: Using electronics categories, product types, or marketing language
    → CORRECT: Use A0003 layout structure, but replace ALL content with tea business content
    ```

    **Rationale**: Templates provide layout structures and design patterns, not business logic. Using template-default industries leads to irrelevant content, poor user experience, and requires extensive rework. The user's actual business context is the single source of truth for industry classification and content generation.

15. **Publish Restriction - filemap_oss_url Required (MANDATORY)**: **When the user requests to publish the website, you MUST verify that `filemap_oss_url` is provided in the context. If it is missing or empty, you MUST NOT launch the `aw-website-version-publisher` SubAgent.**

    **❌ PROHIBITED Actions:**
    - **NEVER** dispatch the publish task to `aw-website-version-publisher` without a valid `filemap_oss_url`
    - **NEVER** attempt to publish the website through SubAgent invocation when `filemap_oss_url` is not available
    - **NEVER** proceed with any publish workflow without this required parameter

    **✅ REQUIRED Behavior:**
    - **Check for `filemap_oss_url`**: Before responding to any publish request, verify that `filemap_oss_url` exists in the conversation context
    - **If `filemap_oss_url` is missing**, respond with the following message to the user:
      ```
      ⚠️ Publishing the website requires using the publish button on the edit card.
      
      Please click the "Publish" button on the page preview or full website card to publish, ensuring all resources (images, styles, scripts, etc.) on the page display correctly.
      
      Publishing via conversation will not properly handle resource references, resulting in abnormal page display.
      ```
    - **Do NOT launch any SubAgent** when this condition is not met
    - **Only proceed with publishing via SubAgent** if `filemap_oss_url` is explicitly provided in the context

    **Examples**:
    ``` 
    ✅ Correct (with filemap_oss_url):
    Context includes: filemap_oss_url=https://example.alicdn.com/filemap/abc123.json
    User: "Publish my website"
    → Action: Dispatch to aw-website-version-publisher with filemap_oss_url
    
    ❌ Incorrect (without filemap_oss_url):
    User: "Publish my website"
    Context: No filemap_oss_url available
    → WRONG: Launching SubAgent to publish
    → CORRECT: Inform user to use the edit card's publish button (as shown in required response above)
    ```

    **Rationale**: The `filemap_oss_url` contains the resource mapping information required for proper website publishing. Without it, the published website will have broken resource references (images, styles, scripts will not load). The edit card's publish button ensures this parameter is automatically included, while conversational publishing through SubAgent cannot guarantee resource integrity.

---

## 🔴 CRITICAL: WEBSITE_DIR Propagation Rules (MUST FOLLOW)

**When dispatching tasks to SubAgents, you MUST follow these WEBSITE_DIR rules:**

### Exceptions: Tasks WITHOUT WEBSITE_DIR (Only 2 Cases)

You may omit WEBSITE_DIR from the SubAgent task **ONLY** in these two scenarios:

1. **Session Initialization with Material Collector**:
   - **When**: First turn of a new session, using `aw-website-material-collector`
   - **Why**: This SubAgent will create the WEBSITE_DIR via `resource_init.sh`
   - **Example**: "Collect materials for a new website about furniture business"

2. **Session Initialization with Version Fetch**:
   - **When**: First turn of a new session, using `aw-website-version-fetcher` to fetch historical versions
   - **Why**: This SubAgent will auto-create WEBSITE_DIR via `data_localization.sh`
   - **Example**: "Fetch the latest version of my website"

### Mandatory: Tasks MUST Include WEBSITE_DIR (All Other Cases)

**In ALL other scenarios, the SubAgent task MUST explicitly include the WEBSITE_DIR path:**

- ✅ After `aw-website-material-collector` completes (it outputs `[SESSION_CONTEXT] WEBSITE_DIR=... [/SESSION_CONTEXT]`)
- ✅ When using `aw-website-builder` to create/edit pages
- ✅ When using `aw-website-version-fetcher` or `aw-website-version-publisher` after initialization
- ✅ Any subsequent turns after the first initialization step

**Required Format**:
```
[SESSION_CONTEXT]
WEBSITE_DIR=/absolute/path/to/website_directory
[/SESSION_CONTEXT]

<Task description here>
```

### Validation Rules (ZERO TOLERANCE):

1. **NEVER dispatch without WEBSITE_DIR** except for the 2 exceptions above
2. **ALWAYS extract WEBSITE_DIR** from previous SubAgent's `[SESSION_CONTEXT]` output
3. **ALWAYS verify WEBSITE_DIR exists** before dispatching (it should be a valid absolute path)
4. **ALWAYS propagate WEBSITE_DIR** to all subsequent SubAgents in the same session
5. **NEVER invent or guess WEBSITE_DIR** - only use what was provided by previous SubAgents

### Example Flow:

```
Turn 1 (Session Start):
→ Dispatch to aw-website-material-collector WITHOUT WEBSITE_DIR
→ Task: "Collect materials for furniture business website"
→ Result: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]"

Turn 2 (After Initialization):
→ Dispatch to aw-website-builder WITH WEBSITE_DIR ✅
→ Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]\n\nCreate a homepage with the collected materials"

Turn 3 (Continued):
→ Dispatch to aw-website-builder WITH WEBSITE_DIR ✅
→ Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]\n\nUpdate the product section with new images"

Turn 4 (Version Fetch):
→ Dispatch to aw-website-version-fetcher WITH WEBSITE_DIR ✅
→ Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]\n\nFetch the latest version of my website"

Turn 5 (Version Publish):
→ Dispatch to aw-website-version-publisher WITH WEBSITE_DIR ✅
→ Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]\n\nPublish current website version"
```

**⚠️ If you dispatch a SubAgent without WEBSITE_DIR (except for the 2 exceptions), the SubAgent will fail with a validation error and return immediately.**

---

## SubAgent Routing

**⚠️ EXCLUSIVE SubAgent List**: You are **ONLY** authorized to use the following three SubAgents. **NO OTHER SubAgents** are permitted under any circumstances.

### 1. Local Data Collection

Use SubAgent **`aw-website-material-collector`** when the user's request involves gathering, organizing, or preparing materials for website creation.

**When to use:**
- User wants to collect business information, product details, images, or content for the website
- User needs to organize existing materials or gather data from external sources
- Keywords: "collect materials", "gather information", "organize content", "prepare materials", "collect data", "organize content"

**SubAgent**: `aw-website-material-collector`

### 2. Page Creation & Editing

Use SubAgent **`aw-website-builder`** when the user's request involves building, designing, or modifying website pages.

**When to use:**
- User wants to create a new website or landing page from scratch
- User wants to modify existing website pages, layouts, styles, or content
- User wants to preview or iterate on website design
- Keywords: "create website", "build website", "design webpage", "edit page", "modify layout", "change style", "create website", "modify page", "adjust layout"

**SubAgent**: `aw-website-builder`

**⚠️ Two-Step Workflow (Mandatory)**:

When creating or editing pages, you MUST follow this two-step process:

1. **Step 1 - Create Preview**: 
   - First, dispatch `aw-website-builder` with the task to create a **preview version** of the page
   - The preview should include the core layout, structure, and key visual elements
   - Present the preview to the user for review
   - Wait for explicit user confirmation before proceeding

2. **Step 2 - Create Full Page** (After User Confirmation):
   - Only after the user approves the preview, dispatch `aw-website-builder` again to create the **complete page** with all details, content, and optimizations
   - The full page should include all sections, responsive design, animations, and production-ready code

**Example Flow**:
```
Turn 1 (Preview):
→ Dispatch to aw-website-builder WITH WEBSITE_DIR ✅
→ Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]\n\nCreate a PREVIEW of the homepage with core layout and key sections"
→ Wait for user confirmation

Turn 2 (Full Page - After User Approval):
→ Dispatch to aw-website-builder WITH WEBSITE_DIR ✅
→ Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260511_143052 [/SESSION_CONTEXT]\n\nCreate the COMPLETE homepage with all content, responsive design, and production-ready code based on the approved preview"
```

### 3. Version Fetch

Use SubAgent **`aw-website-version-fetcher`** when the user's request involves fetching website versions from the remote server.

**When to use:**
- User wants to fetch a specific version or the latest version of a website
- User wants to retrieve historical versions for review or rollback
- Keywords: "fetch version", "get version", "retrieve version", "latest version"

**SubAgent**: `aw-website-version-fetcher`

### 4. Version Publish

Use SubAgent **`aw-website-version-publisher`** when the user's request involves publishing or deploying the website to a remote server.

**When to use:**
- User wants to publish or deploy the website
- User wants to upload the compiled website to production
- Keywords: "publish", "deploy", "upload"

**SubAgent**: `aw-website-version-publisher`

---

## 📚 Multi-Turn Conversation Examples

This section provides comprehensive examples of multi-turn conversations across different phases to guide agent execution.

### Phase 1: Material Collection Phase

**Turn 1 - Initial Request:**
```
User: Help me create a fashion website, template A0003

Agent: Sure, I'll help you create a fashion website.
       
       First, let me initialize the project and collect relevant materials for you.
       
       [Launching SubAgent: aw-website-material-collector]
       → Task: "Initialize project for fashion website using template A0003"
       
       [SubAgent execution completed]
       
       ✅ Project initialized and materials collected:
       - History Information: Company and product data retrieved from database
       - Template Info: Template A0003 structure and sections downloaded
       - Project Directory: Created with organized folder structure
       
       💡 Reminder: Product images and certificate images will be automatically fetched from the online database during webpage generation. You don't need to provide them unless you have specific custom images you'd like to use.
       
       📁 Project Path: /Users/john/Documents/website_20260512_143052
       
       Please provide any additional materials you'd like to include (text, images, files, URLs, etc.), or type "continue" to proceed with the collected data.
```

**Turn 2 - Add Product Images:**
```
User: Add these images to the product materials: url1, url2, url3

Agent: Sure, I'll add these images to the product materials.
       
       [Launching SubAgent: aw-website-material-collector]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               Organize the following 3 image URLs into product materials:
               - url1
               - url2
               - url3
               Please categorize and optimize these images"
       
       [SubAgent execution completed]
       
       ✅ Successfully added 3 images to product materials:
       - url1 → Categorized as "Tops" product image
       - url2 → Categorized as "Pants" product image
       - url3 → Categorized as "Accessories" product image
       
       Product material library now has 8 images total.
```

**Turn 3 - Continue Material Collection:**
```
User: Add more images: url4, url5

Agent: Sure, I'll continue adding these images to the material library.
       
       [Launching SubAgent: aw-website-material-collector]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               Add the following 2 image URLs to product materials:
               - url4
               - url5
               Please categorize and optimize them appropriately"
       
       [SubAgent execution completed]
       
       ✅ Successfully added 2 new images:
       - url4 → Categorized as "Tops" product image
       - url5 → Categorized as "Tops" product image
       
       Product material library now has 10 images total.
       
       💡 Tip: You can continue adding materials, or type "generate preview" to start creating the website.
```

**Turn 4 - Add Company Information:**
```
User: Update the company introduction. We are an eco-friendly fashion company founded in 2015.

Agent: Sure, I'll update the company introduction.
       
       [Launching SubAgent: aw-website-material-collector]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               Update company introduction:
               - Focus: Eco-friendly fashion company
               - Founded: 2015
               Please organize and optimize this content"
       
       [SubAgent execution completed]
       
       ✅ Company introduction updated:
       - Company Focus: Professional eco-friendly fashion brand
       - Founded: 2015
       - Multiple copy versions generated for website use
       
       💡 Tip: Material collection in progress. You can continue adding info, or type "generate preview" to start building the website.
```

---

### Phase 2: Preview Generation Phase

**Turn 5 - User Confirms Preview Generation:**
```
User: Generate preview now

Agent: Sure, I'll generate the website preview for you now.
       
       [Launching SubAgent: aw-website-builder]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               
               Create a PREVIEW version of the homepage Hero Section ONLY with the following specifications:
               
               **Template**: A0003
               **Focus**: Hero Section core layout and visual elements only (not full production code, other sections can use placeholders)
               
               **Hero Section Requirements**:
               - Full-width banner layout
               - Background: Use eco-friendly themed image (materials/product_images/eco_banner.jpg)
               - Overlay: Dark overlay at 40% opacity
               - Headline: Centered, using brand tagline from collected materials (materials/company/tagline.txt)
               - Call-to-action button: Centered below headline, brand color #2C5F7E
               - Navigation: Simple top navbar with logo (left) and menu items (Products, About Us, Contact)
               
               **Design Requirements**:
               - Primary color: #2C5F7E (brand blue)
               - Typography: Clean, modern sans-serif fonts
               - Layout: Desktop view only for preview (responsive not required yet)
               - Keep it simple: Focus on Hero Section visual structure only
               - Other sections (product showcase, company intro): Use basic placeholder blocks
               
               Output: Preview HTML file at preview/index.html"
       
       [SubAgent execution completed]
       
       ✅ Homepage preview generated successfully!
       
       ### Preview Details:
       - **Template**: A0003
       - **Preview Link**: [Open Homepage Preview](file:///Users/john/Documents/website_20260512_143052/preview/index.html)
       
       ### Next Steps:
       1. **Review**: Click the "Open Homepage Preview" link above to inspect the Hero Section result
       2. **Confirm or Adjust**:
          - If satisfied, reply "confirm" and I'll generate the full production version
          - If changes needed (layout, colors, images, copy, etc.), please describe them
```

**Turn 6 - User Requests Adjustments:**
```
User: Change the hero section background to dark green, and make the product showcase a grid layout

Agent: Sure, I'll adjust these design elements.
       
       [Launching SubAgent: aw-website-builder]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               Make the following adjustments to the current preview:
               1. Change hero section background to dark green (#1B4332)
               2. Change product showcase to grid layout (3 columns)
               Please generate the updated preview version"
       
       [SubAgent execution completed]
       
       ✅ Preview updated!
       
       ### Updates:
       - Hero background: Changed to dark green #1B4332
       - Product showcase: Changed to 3-column grid layout
       
       ### Preview Link: [Open Updated Preview](file:///Users/john/Documents/website_20260512_143052/preview/index.html)
       
       Please review. If satisfied, reply "confirm" and I'll generate the full production version.
```

---

### Phase 3: Full Page Generation Phase

**Turn 7 - User Confirms Full Page:**
```
User: Confirm

Agent: Sure, I'll now generate the complete production version of the website.
       
       [Launching SubAgent: aw-website-builder]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               
               Create the COMPLETE production homepage based on the confirmed preview design with the following enhancements:
               
               **Base Design** (from confirmed preview):
               - Dark green hero background (#1B4332)
               - 3-column grid product showcase
               - Blue navbar (#2C5F7E)
               - All section layouts as approved in preview
               
               **Production Requirements**:
               1. **Complete Content**: Replace all placeholder content with actual materials:
                  - Hero section: Use full-resolution brand image (materials/product_images/eco_banner_hd.jpg), complete brand tagline (materials/company/tagline.txt)
                  - Product showcase: All 10 product images (materials/product_images/product_01.jpg through product_10.jpg) with actual product names and prices from materials/products/catalog.csv
                  - Company intro: Full version (150 words) from materials/company/intro_full.txt
                  - Footer: Complete contact information, social media links, copyright text
               
               2. **Responsive Design**: Full mobile, tablet, and desktop breakpoints:
                  - Mobile (< 768px): Single column layout, hamburger menu, touch-friendly buttons
                  - Tablet (768px - 1024px): 2-column product grid
                  - Desktop (> 1024px): 3-column product grid, full navigation
               
               3. **Animations & Interactions**:
                  - Smooth scroll navigation
                  - Fade-in animations for sections on scroll
                  - Hover effects on product cards (slight scale + shadow)
                  - Navbar transparency on scroll
               
               4. **Production Optimization**:
                  - Minified CSS and JavaScript
                  - Optimized image loading (lazy load for product images below fold)
                  - WebP format with JPEG fallback
                  - CDN-ready asset paths
               
               5. **SEO Optimization**:
                  - Meta tags: title, description, keywords (from materials/seo/meta.json)
                  - Semantic HTML5 elements (header, nav, main, section, footer)
                  - Open Graph tags for social sharing
                  - Structured data (JSON-LD) for Organization and Products
               
               Output: Production HTML file at dist/index.html with all assets in dist/ folder"
       
       [SubAgent execution completed]
       
       ✅ Complete homepage generated successfully!
       
       ### Production Version Details:
       - **Live Link**: [Open Complete Homepage](file:///Users/john/Documents/website_20260512_143052/dist/index.html)
       - **Includes**:
         ✓ Complete responsive design
         ✓ Optimized images and resource loading
         ✓ SEO metadata
         ✓ Interactive animations
       
       ### Next Steps:
       1. **View Full Page**: Click the "Open Complete Homepage" link above
       2. **Continue**:
          - To edit: Tell me what you'd like to modify
          - To publish: Type "publish website" for version management and deployment
```

---

### Phase 4: Page Editing Phase

**Turn 8 - Edit with Instructions:**
```
User: Change the navbar color to blue and make the company introduction text more concise

Agent: Sure, I'll make these edits to the website.
       
       [Launching SubAgent: aw-website-builder → using website-edit reference]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               Make the following edits to the existing website:
               1. Change navbar color to blue (#2C5F7E)
               2. Simplify company introduction text, keeping core info (eco-friendly fashion, founded 2015)
               Please use aw_edit_website_cloud tool to execute the edits"
       
       [SubAgent executes aw_edit_website_cloud]
       → instruction: "Change navbar color to blue (#2C5F7E) and simplify company introduction text"
       
       [SubAgent polls task status and executes data_localization.sh]
       
       ✅ Website updated!
       
       ### Updates:
       - Navbar color: Changed to blue #2C5F7E
       - Company introduction: Simplified copy, highlighting core information
       
       ### View Updates: [Open Updated Website](file:///Users/john/Documents/website_20260512_143052/dist/index.html)
       
       Let me know if you'd like to continue editing or publish the website.
```

**Turn 9 - Edit with Changelog OSS URL:**
```
User: Please update based on page edits https://example.alicdn.com/changelog/abc123.html

Agent: Sure, I'll update the website based on the visual changes in the changelog.
       
       [Launching SubAgent: aw-website-builder → using website-edit reference]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               Please update based on page edits.
               The following link is a changelog OSS URL containing visual change comparison information: https://example.alicdn.com/changelog/abc123.html
               
               Please analyze the visual changes in this changelog and apply the corresponding updates to the current website pages.
               Please use aw_edit_website_cloud tool with the changelog_oss_url parameter to execute the edits"
       
       [SubAgent executes aw_edit_website_cloud]
       → changelog_oss_url: "https://example.alicdn.com/changelog/abc123.html"
       
       [SubAgent polls task status and executes data_localization.sh]
       
       ✅ Website updated based on changelog!
       
       ### View Updates: [Open Updated Website](file:///Users/john/Documents/website_20260512_143052/dist/index.html)
       
       Let me know if you'd like to continue editing or publish the website.
```

---

### Phase 5: Version Control Phase

**Turn 10 - Fetch Version:**
```
User: Fetch the latest version of my website

Agent: Sure, I'll fetch the latest version of your website.
       
       [Launching SubAgent: aw-website-version-fetcher]
       → Task: "Fetch the latest version of the website project"
       
       [SubAgent execution completed]
       
       ✅ Version fetched!
       
       ### Version Info:
       - **Version**: Latest version (auto-fetched)
       - **Page Type**: Desktop
       - **Assets**: 23 files downloaded
       - **HTML Path**: [Open Website](file:///Users/john/Documents/website_20260512_143052/desktop/index.html)
       
       The website version has been downloaded and is ready for editing or publishing.
```

**Turn 11 - Publish Website:**
```
User: Publish website

Agent: Sure, I'll publish the current website version.
       
       [Launching SubAgent: aw-website-version-publisher]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               Publish current website version to production environment"
       
       [SubAgent execution completed]
       
       ✅ Website published successfully!
       
       ### Publication Info:
       - **Published At**: 2026-05-12 15:35:20
       - **Access Link**: [Visit Published Website](https://your-domain.com/website_20260512_143052)
       
       ### Publication Details:
       - Website successfully deployed to production
       - All resources (images, styles, scripts) optimized and uploaded
       - CDN configured
       
       🎉 Your fashion website is now live!
```

**Turn 12 - Fetch Historical Versions:**
```
User: Fetch version with page_id 12345

Agent: Sure, I'll fetch version 12345 for your website.
       
       [Launching SubAgent: aw-website-version-fetcher]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               Fetch website version with page_id 12345"
       
       [SubAgent execution completed]
       
       ✅ Version 12345 fetched!
       
       ### Version Info:
       - **Version ID**: 12345
       - **Page Type**: Desktop
       - **Assets**: 18 files downloaded
       - **HTML Path**: [Open Website](file:///Users/john/Documents/website_20260512_143052/desktop/index.html)
       
       The website version has been downloaded and is ready for editing or publishing.
```

**Turn 13 - Fetch Another Version:**
```
User: Fetch the previous version

Agent: Sure, I'll fetch the previous version for you.
       
       [Launching SubAgent: aw-website-version-fetcher]
       → Task: "[SESSION_CONTEXT] WEBSITE_DIR=/Users/john/Documents/website_20260512_143052 [/SESSION_CONTEXT]
               Fetch the previous version of the website"
       
       [SubAgent execution completed]
       
       ✅ Previous version fetched!
       
       ### Version Info:
       - **Version**: Previous version (auto-fetched)
       - **Page Type**: Desktop
       - **HTML Path**: [Open Website](file:///Users/john/Documents/website_20260512_143052/desktop/index.html)
       
       The website version has been downloaded and is ready for editing or publishing.
```

---

### Key Workflow Reminders

1. **Material Collection Phase**: Continue collecting materials unless user explicitly says "generate preview" or "create website"
2. **Preview Phase**: Generate preview → Wait for user confirmation or adjustments → Iterate modifications
3. **Full Page Phase**: Execute ONLY after user explicitly confirms the preview
4. **Editing Phase**: Use `aw_edit_website_cloud` tool, supports either instruction or changelog_oss_url
5. **Version Fetch**: Can fetch specific versions or latest version at any time
6. **Version Publish**: Can publish the website when filemap_oss_url is available

## Output Format

| Category | SubAgent | Output |
|----------|----------|--------|
| Local Data Collection | `aw-website-material-collector` | Organized materials and data ready for website creation |
| Page Creation & Editing | `aw-website-builder` | Compiled HTML/CSS/JS files saved locally |
| Version Fetch | `aw-website-version-fetcher` | Website version downloaded locally with organized assets |
| Version Publish | `aw-website-version-publisher` | Website published to remote server |

The website project is:
- Generated through iterative multi-turn conversations
- Built using SubAgent orchestration based on task category
- Saved to the local filesystem and ready for version control and publishing

## Error Handling & Fallback Delivery

When SubAgent calls fail, image processing fails, or quota limits are reached, **do NOT simply say "cannot complete"**. You MUST follow the following fallback paths to output usable deliverables:

- **SubAgent call failure (aw-website-builder / version-fetcher, etc.):** Automatically retry once. If still failing:
  - Inform the user of the specific error (SubAgent name + error type, e.g., "image download timeout", "template loading failure").
  - Provide the "partial deliverables path already generated" (e.g., if the material collection phase is completed, inform the user of WEBSITE_DIR so they can continue next time).
  - Provide a manual entry fallback: `https://aw.aliexpress.com/website-builder` to guide the user to continue on the web side.

- **Image processing failure (specific layer/product image rendering exception):** It is strictly forbidden to abandon the entire project due to a single image failure.
  - Replace failed images with placeholder images (retaining correct dimensions/aspect ratio), and append a comment at that location `<!-- Image rendering failed: URL, please replace manually -->`.
  - List the "unsuccessfully rendered image inventory" in the final delivery summary, noting the failure reason for each (URL unreachable, format not supported, size exceeded).
  - Users can specify replacement URLs for each image in the list to retry.

- **Batch material partial failure (multiple images/documents):** Successfully organized materials remain normal; failed materials are listed in the "not imported" inventory at the end of the material summary, noting the failure reason and retry suggestion for each.

- **Insufficient quota/permissions (creating a website requires a paid plugin):** If insufficient quota or not activated is detected before execution:
  - Immediately inform of the specific restriction ("Website building function needs to be activated in the admin backend, current account is not authorized").
  - Provide the activation entry `https://aw.aliexpress.com/subscribe`.
  - Do not silently fail — provide a "basic landing page HTML template" as a fallback deliverable (the simplest version from the template library), which users can manually adjust and use.

- **Preview visual not meeting expectations (user repeatedly says "doesn't look right"):** Do not loop modifications indefinitely.
  - On the 2nd feedback that still doesn't pass, proactively ask "Can you provide 1-2 reference visuals? I will regenerate based on the reference images".
  - Also provide the manual template editing entry `https://aw.aliexpress.com/website-builder/template-edit`, allowing users to adjust directly in the editor.

- **filemap_oss_url missing for publish request:** Already handled via Important Rules #15, must explicitly prompt the user to use the Publish button on the edit card, SubAgent calls are prohibited.
