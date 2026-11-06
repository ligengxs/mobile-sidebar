window.__ModuleLoader__.load({
	id: 'mobile-sidebar',
	factory(require) {
		const React = require('react');
		const h = React.createElement;

		/** Dictionary namespace owned by this plugin. */
		const NS = 'mobile-sidebar';
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = { open: '打开侧边栏' };
		/** English dictionary, checked complete against the zh key set. */
		const en = { open: 'Open sidebar' };

		/**
		 * Frame geometry. The shipped AppFrame keeps a 56px collapsed rail on
		 * non-desktop platforms (`collapsedWidth`); the fully hidden collapse is
		 * the macOS desktop presentation. While the sidebar is collapsed and the
		 * right column reserves no track, zero the sidebar track so the rail
		 * takes no space at all — the same fully-hidden presentation the macOS
		 * desktop shell uses, driven purely by the frame's own published
		 * `data-sidebar-collapsed` / `data-rightbar-collapsed` attributes. With a
		 * right-column track the override stays off, because the frame's inline
		 * template carries that track's dynamic width and CSS cannot reproduce
		 * it; the rail keeps its shipped reopen toggle in that state.
		 *
		 * Mutual exclusion of the two toggles: while the sidebar is expanded (or
		 * collapsed-with-rail, the right-track case) the sidebar's own button is
		 * the only toggle, and the header button stays display:none. Only when
		 * the sidebar is fully hidden — the same two-attribute condition as the
		 * grid override — does the header button appear as the reopen control,
		 * so exactly one toggle is visible in every state. The visibility rule
		 * outranks the base rule, so the platform guards need !important; the
		 * desktop shells keep their own window-chrome toggle (and the
		 * windows-titlebar one is fixed-position, always reachable).
		 *
		 * The header button only ever renders visibly in the collapsed state,
		 * so its accessible name and tooltip are the static "open" phrasing.
		 *
		 * The animation is a structural clone of the right sidebar's dock
		 * slide, whose transitions are declared unconditionally rather than
		 * gated on the frame's transient `data-animating` flag: the sidebar
		 * root (the div whose first child is the brand drag row) always
		 * carries a transform transition, and the fully-hidden state glides
		 * it out by exactly the captured sidebar width W with a delayed
		 * visibility flip — the same closed-dock rule shape the right panel
		 * uses. The content's edge stays glued to the closing track edge in
		 * both directions, so the motion matches the right panel's rhythm.
		 * The width is captured at collapse-start by a MutationObserver on
		 * the frame's `data-sidebar-collapsed` attribute (published as the
		 * frame's CSS contract) and written back as the frame-level
		 * `--shide-sidebar-width` custom property; at that moment the
		 * sidebar still renders its wide layout with the inline width, so
		 * the read is exact, and the fixed pixel distance never retargets
		 * when the sidebar switches to rail layout at its 150ms settle
		 * point. The frame's track transition is armed unconditionally as
		 * well, keyed on the frame's inline grid-template-columns style hook
		 * and honoring the same dragging/instant/fullscreen guards the
		 * shipped rule uses; the sidebar column also opens its clip while
		 * fully hidden so the gliding content passes under the center
		 * column instead of being clipped away mid-slide. The shipped 150ms
		 * fade is kept — it masks the settle switch — and the rail-mode
		 * content that mounts at the settle point is held invisible. The
		 * expand direction has no settle switch, so the content glides back
		 * in opaque with the root's fade-in keyframes disabled, exactly
		 * like the right panel's open.
		 *
		 * The last two rules move the sidebar's own toggle to the head of its
		 * brand row and align it with the conversation header's toggle: the
		 * header button sits at x=20 (header padding-left) with its center at
		 * y=25 (header padding-top 10 plus the 30px title row), while the
		 * shipped brand row places the toggle at x=16 (root padding 12 + row
		 * padding 4) with its center at y=36 (root padding-top 6 plus the 60px
		 * row) — the toggle shifts up 11px and right 4px so both buttons sit
		 * on one line across the sidebar/main boundary and the collapse
		 * handoff (the sidebar button gliding out, the header button riding
		 * in with the center column) stays seamless. The selector matches the
		 * shipped button by its panel-left icon path inside a drag-row div —
		 * the only such button; the conversation header's copy of the same
		 * icon lives under `div[data-conversation-header-leading]`, which
		 * carries no drag attribute, so it is unaffected. `position:relative`
		 * shifts the visual box only (the shipped icon button is already
		 * relative); the html guards keep desktop shells' own toggle chrome
		 * untouched, and other drag rows (plugin-manager detail top) hold no
		 * panel-left icon.
		 *
		 * With both brand occupants empty, the identity button in the brand
		 * row would remain an invisible click target (the shipped row starts
		 * a new session when clicked) occupying the row's flex space, so the
		 * final rule holds it at visibility:hidden: the layout filler stays
		 * (keeping the toggle at the row head), but the row no longer traps
		 * clicks or exposes the empty control to assistive tech. The rule
		 * keys on the empty name occupant's marker class — only the identity
		 * button contains the name slot (the collapsed rail's mark badge does
		 * not), and a plain single-level :has() is used because nested
		 * :has() selectors are invalid and would drop the whole rule.
		 *
		 * Below 768px the sidebar clones the right dock's mobile presentation.
		 * The right panel derives fullscreen from the frame width
		 * (autoFullscreen = viewportWidth < 768), never takes a track in that
		 * state, and slides over the conversation at the full viewport width;
		 * on wider frames it pushes the center by reserving its track. The
		 * left column gets the same split here: on mobile the frame keeps the
		 * sidebar track at zero and the sidebar root becomes an overlay
		 * anchored to the frame's left edge at width:100vw — an explicit
		 * viewport width, exactly like the right panel's own width:100vw, so
		 * the overlay never depends on which ancestor happens to be the
		 * absolute containing block. The root is targeted through
		 * `div:has(> div[data-window-drag])` rather than as the column's first
		 * div child, because the slot system wraps the sidebar occupant in a
		 * `display:contents` div (inline `display: contents;`): that wrapper
		 * generates no box, so positioning it does nothing and the real root
		 * would stay inside the zero-width column, painted under the opaque
		 * center column. The drag-row parent is the real root at any wrapper
		 * depth. Closed, the overlay root is parked one full viewport width to
		 * the left with a delayed visibility flip and pointer-events:none, so
		 * the parked drawer can never intercept the header's reopen button;
		 * the boxless wrapper keeps carrying the general collapsed-state
		 * visibility (hidden inherits to the root), which leaves the desktop
		 * collapse path exactly as before. At 768px and up the original track
		 * push and expanded width stay untouched. The threshold matches the right panel's own <768
		 * autoFullscreen rule; the shell draws no page scrollbar, so the
		 * viewport width and the frame width agree.
		 *
		 * On that same mobile layout, every navigation dismisses the drawer:
		 * the drawer covers the whole viewport there, so leaving it open
		 * would hide the conversation just opened — whether the pick was a
		 * row in the tree or a search result, or a brand-new Session started
		 * from the drawer's New session button or a Workspace row's action.
		 * Rather than sniffing the many buttons that start a navigation (and
		 * the shipped row actions that stopPropagation, which a document
		 * listener never sees), the dismissal follows the Workspace UI's own
		 * navigation record: `uiWorkspace.selection` is a snapshot store
		 * that the Workspace service republishes on every replaceMain and
		 * clearMain — one notification per main-view change, whatever
		 * triggered it. The subscription acts only while the mobile
		 * breakpoint matches and the sidebar is open (read from the frame's
		 * published `data-sidebar-collapsed`), so desktop keeps the sidebar
		 * beside the conversation and a collapsed drawer never re-expands
		 * from a navigation. Notifications closer together than the settle
		 * window are folded into one dismissal, so a navigation that
		 * republishes twice cannot toggle the drawer back open.
		 */
		const CSS = [
			'[data-sidebar-collapsed][data-rightbar-collapsed]{grid-template-columns:0px minmax(0px,1fr) minmax(0px,0px)!important}',
			'.shide-toggle{border-radius:var(--dsw-radius-sm);cursor:pointer;width:28px;height:28px;margin:0;padding:0;border:none;color:var(--dsw-alias-label-secondary);background:0 0;flex:none;justify-content:center;align-items:center;display:none;position:relative;font:inherit}',
			'.shide-toggle:hover{background:var(--dsw-alias-interactive-bg-hover)}',
			'.shide-toggle:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsh-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}',
			'[data-sidebar-collapsed][data-rightbar-collapsed] .shide-toggle{display:inline-flex}',
			'html[data-platform="darwin"] .shide-toggle,html[data-windows-titlebar] .shide-toggle{display:none!important}',
			'div[style*="grid-template-columns"]:not([data-dragging]):not([data-rightbar-instant]):not([data-rightbar-fullscreen]){transition:grid-template-columns var(--ds-transition-duration-slow) var(--ds-ease-in-out)}',
			'div:has(> div[data-window-drag]){transition:transform var(--ds-transition-duration-slow) var(--ds-ease-in-out);animation:none}',
			'[data-sidebar-collapsed][data-rightbar-collapsed] > div:first-child > div{transform:translateX(calc(-1 * var(--shide-sidebar-width, 420px)));visibility:hidden;transition:transform var(--ds-transition-duration-slow) var(--ds-ease-in-out),visibility 0s linear var(--ds-transition-duration-slow)}',
			'[data-sidebar-collapsed][data-rightbar-collapsed] > div:first-child{overflow:visible}',
			'[data-sidebar-collapsed][data-rightbar-collapsed] > div:first-child > div:not([style]) > *{opacity:0;animation:none}',
			'@media (prefers-reduced-motion:reduce){div[style*="grid-template-columns"]:not([data-dragging]):not([data-rightbar-instant]):not([data-rightbar-fullscreen]),div:has(> div[data-window-drag]),[data-sidebar-collapsed][data-rightbar-collapsed] > div:first-child > div{transition:none}}',
			'@media (max-width:767px){div[style*="grid-template-columns"][data-rightbar-collapsed]{grid-template-columns:0px minmax(0px,1fr) minmax(0px,0px)!important}div[style*="grid-template-columns"][data-rightbar-collapsed] > div:first-child{overflow:visible}div[style*="grid-template-columns"][data-rightbar-collapsed] > div:first-child div:has(> div[data-window-drag]){position:absolute;top:0;bottom:0;left:0;width:100vw!important;z-index:20}div[style*="grid-template-columns"][data-rightbar-collapsed][data-sidebar-collapsed] > div:first-child div:has(> div[data-window-drag]){transform:translateX(-100vw);pointer-events:none}}',
			'html:not([data-platform="darwin"]):not([data-windows-titlebar]) div[data-window-drag] > button:has(svg path[d="M5.5 1.5V14.5"]){order:-1;position:relative;top:-11px;left:4px}',
			'div[data-window-drag] > button:has(.shide-empty-name){visibility:hidden}'
		].join('\n');

		/** Stable empty catalog for the missing-service fallback. */
		const NO_ROWS = [];
		/** Fallback shortcut catalog API when the service is absent. */
		const FALLBACK_CATALOG = {
			subscribe: () => () => {},
			getSnapshot: () => NO_ROWS
		};

		/** Mobile breakpoint shared with the overlay rules and the right dock's autoFullscreen. */
		const MOBILE_QUERY = '(max-width: 767px)';

		/**
		 * The application frame: the element that publishes the sidebar track
		 * template inline, identified by the sidebar root's drag row anywhere
		 * beneath it (the slot system wraps the root in a display:contents
		 * div, so the drag row is the stable landmark at any wrapper depth).
		 * The frame carries `data-sidebar-collapsed` exactly while the
		 * sidebar is hidden; its absence means the column is open.
		 * @returns the frame element, or null before the shell mounts.
		 */
		function frameElement() {
			return document.querySelector('div[style*="grid-template-columns"]:has(div[data-window-drag])');
		}

		/**
		 * The sidebar toggle in the conversation header's leading seat, before
		 * the Session title. The frame fully hides the collapsed rail, so the
		 * header button is the resident reopen affordance — and the CSS keeps
		 * it display:none unless the sidebar is fully hidden, so exactly one
		 * toggle (the sidebar's own, or this one) is visible in any state. The
		 * button is therefore only ever seen in the collapsed state, so both
		 * the accessible name and the tooltip carry the static "open"
		 * phrasing. `t` arrives as a slot prop through the registration's
		 * `locale` option.
		 * @param props - slot props plus ctx and the shortcut catalog API.
		 * @returns the header toggle button.
		 */
		function HeaderToggle({ ctx, t, shortcutApi }) {
			const rows = React.useSyncExternalStore(shortcutApi.subscribe, shortcutApi.getSnapshot);
			const shortcut = rows.find((row) => row !== null && row !== undefined && row.id === 'sidebar.left.toggle');
			const keys = Array.isArray(shortcut?.keys) ? shortcut.keys : [];
			const title = keys.length > 0 ? `${t('open')} (${keys.join('+')})` : t('open');
			return h('button', {
				type: 'button',
				className: 'shide-toggle',
				title,
				'aria-label': t('open'),
				'aria-keyshortcuts': typeof shortcut?.aria === 'string' ? shortcut.aria : undefined,
				onClick: () => {
					ctx.layout.toggleSidebar();
				}
			}, h('svg', {
				viewBox: '0 0 16 16',
				width: 16,
				height: 16,
				fill: 'none',
				'aria-hidden': true,
				'stroke-width': 1
			}, h('path', {
				d: 'M13.5 1.5H2.5C1.94772 1.5 1.5 1.94772 1.5 2.5V13.5C1.5 14.0523 1.94772 14.5 2.5 14.5H13.5C14.0523 14.5 14.5 14.0523 14.5 13.5V2.5C14.5 1.94772 14.0523 1.5 13.5 1.5Z',
				stroke: 'currentColor'
			}), h('path', {
				d: 'M5.5 1.5V14.5',
				stroke: 'currentColor'
			})));
		}

		/**
		 * The empty brand occupants. The official build registers its fish
		 * mark and wordmark into `sidebar.brand.mark` / `sidebar.brand.name`
		 * at the default priority; single-slot entries with a lower priority
		 * render instead ("lowest renders"), so these registrations shadow
		 * both without touching the surrounding brand-row controls.
		 * Rendering an element (not null) keeps the slots' shipped fallbacks
		 * from applying. The name occupant carries a marker class so the
		 * leftover identity button (which contains the name slot, unlike the
		 * collapsed rail's mark badge) can be neutralized with a plain
		 * single-level :has() selector.
		 * @returns an empty, non-interactive placeholder.
		 */
		function EmptyBrandMark() {
			return h('span', { 'aria-hidden': true, className: 'shide-empty-mark' });
		}

		/**
		 * The empty name occupant; see EmptyBrandMark for the shadowing
		 * strategy and the marker's purpose.
		 * @returns an empty, non-interactive placeholder.
		 */
		function EmptyBrandName() {
			return h('span', { 'aria-hidden': true, className: 'shide-empty-name' });
		}

		return {
			inject: ['slots', 'layout', 'locale', 'shortcuts'],
			apply(ctx) {
				ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'mobile-sidebar: dictionary');
				ctx.effect(() => {
					const tag = document.createElement('style');
					tag.dataset.plugin = 'mobile-sidebar';
					tag.dataset.pluginCss = 'mobile-sidebar/mobile-sidebar.css';
					tag.textContent = CSS;
					document.head.appendChild(tag);
					return () => {
						tag.remove();
					};
				}, 'mobile-sidebar: frame styles');
				const raw = ctx.shortcuts?.catalog;
				const shortcutApi = raw !== null && raw !== undefined && typeof raw.getSnapshot === 'function' && typeof raw.subscribe === 'function' ? {
					subscribe: (listener) => raw.subscribe(listener),
					getSnapshot: () => raw.getSnapshot()
				} : FALLBACK_CATALOG;
				ctx.effect(() => ctx.slots.inject('conversation.header.leading', () => ctx.slots.register({
					name: 'conversation.header.leading',
					locale: NS
				}, (props) => h(HeaderToggle, { ...props, ctx, shortcutApi }))), 'mobile-sidebar: header toggle');
				ctx.effect(() => ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({
					name: 'sidebar.brand.mark',
					priority: -1
				}, EmptyBrandMark)), 'mobile-sidebar: empty brand mark');
				ctx.effect(() => ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register({
					name: 'sidebar.brand.name',
					priority: -1
				}, EmptyBrandName)), 'mobile-sidebar: empty brand name');
				ctx.effect(() => {
					const observer = new MutationObserver((records) => {
						for (const record of records) {
							const frame = record.target;
							if (!(frame instanceof Element) || !frame.hasAttribute('data-sidebar-collapsed')) continue;
							const dragRow = frame.querySelector(':scope > div:first-child div[data-window-drag]');
							const root = dragRow === null || dragRow === undefined ? null : dragRow.parentElement;
							const width = root === null || root === undefined ? 0 : root.getBoundingClientRect().width;
							if (width > 0) frame.style.setProperty('--shide-sidebar-width', `${Math.round(width)}px`);
						}
					});
					const mount = document.body === null || document.body === undefined ? document.documentElement : document.body;
					observer.observe(mount, { subtree: true, attributeFilter: ['data-sidebar-collapsed'] });
					return () => {
						observer.disconnect();
					};
				}, 'mobile-sidebar: sidebar width capture');
				ctx.inject(['uiWorkspace'], (scope) => {
					const selection = scope.uiWorkspace?.selection;
					if (selection === null || selection === undefined || typeof selection.subscribe !== 'function') return;
					if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
					if (typeof ctx.layout?.toggleSidebar !== 'function') return;
					const mobile = window.matchMedia(MOBILE_QUERY);
					let dismissedAt = 0;
					scope.effect(() => {
						const off = selection.subscribe(() => {
							if (!mobile.matches) return;
							const now = Date.now();
							if (now - dismissedAt < 400) return;
							const frame = frameElement();
							if (frame === null || frame === undefined || frame.hasAttribute('data-sidebar-collapsed')) return;
							dismissedAt = now;
							ctx.layout.toggleSidebar();
						});
						return () => {
							off();
						};
					}, 'mobile-sidebar: dismiss drawer on navigation');
				});
			}
		};
	}
});
