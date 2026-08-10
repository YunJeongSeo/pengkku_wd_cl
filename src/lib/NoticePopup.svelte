<script lang="ts">
	let { open = $bindable() }: { open: boolean } = $props();
	let closing = $state(false);

	function close() {
		closing = true;
		setTimeout(() => {
			open = false;
			closing = false;
		}, 280);
	}
</script>

<!-- {#if open || closing}
	<div class="notice-overlay" class:closing onclick={close}>
		<div class="notice-card" class:closing onclick={(e) => e.stopPropagation()}>
			<p class="notice-label">안내말씀</p>
			<p class="notice-msg">화환은 정중히 사양합니다</p>
			<p class="notice-sub">
				넘치는 사랑과 축하에 감사드립니다.<br />
				부담 갖지 마시고 참석만으로도<br />
				충분한 축복이 됩니다.
			</p>
			<button class="notice-close" onclick={close}>확인</button>
		</div>
	</div>
{/if} -->

<style>
	.notice-overlay {
		position: fixed; inset: 0;
		z-index: 500;
		display: flex; align-items: center; justify-content: center;
		background: rgba(0, 0, 0, 0.45);
		animation: fade-in 0.3s ease forwards;
		padding: 1.5rem;
	}
	.notice-overlay.closing { animation: fade-out 0.28s ease forwards; }

	.notice-card {
		width: 100%; max-width: 320px;
		background: #fff;
		border-radius: 16px;
		padding: 2.2rem 1.8rem 1.6rem;
		text-align: center;
		animation: pop-in 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}
	.notice-card.closing { animation: pop-out 0.26s ease forwards; }

	.notice-label {
		font-family: 'Crimson Pro', serif;
		font-size: 13px; letter-spacing: 2px;
		color: var(--text);pacity: .8;
		margin-bottom: 6px;
	}
	.notice-msg {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 18px; font-weight: 500;
		color: #1a1a1a; letter-spacing: -.02em;
		margin-bottom: 20px;
		line-height: 1.5;
	}
	.notice-sub {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 13px; color: #888;
		line-height: 1.6; margin-bottom: 1.8rem;
	}
	.notice-close {
		width: 100%; padding: .75rem;
		background: #1a1a1a; color: #fff;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 15px; border: none;
		border-radius: 10px; cursor: pointer;
		transition: background .15s;
	}
	.notice-close:hover { background: #333; }

	@keyframes fade-in  { from { background: rgba(0,0,0,0); }    to { background: rgba(0,0,0,0.45); } }
	@keyframes fade-out { from { background: rgba(0,0,0,0.45); } to { background: rgba(0,0,0,0); }    }
	@keyframes pop-in   { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
	@keyframes pop-out  { from { opacity: 1; transform: scale(1); }   to { opacity: 0; transform: scale(.85); } }
</style>
