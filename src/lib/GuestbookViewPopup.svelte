<script lang="ts">
	interface Msg { id: number; name: string; text: string; date: string }

	let {
		open = $bindable(),
		msgs,
		onDelete,
	}: {
		open: boolean;
		msgs: Msg[];
		onDelete?: (id: number, password: string) => Promise<boolean>;
	} = $props();

	let closing        = $state(false);
	let menuOpenIdx     = $state<number | null>(null);
	let deleteTargetIdx = $state<number | null>(null);
	let deletePassword = $state('');
	let deleteError    = $state(false);
	let deleting       = $state(false);

	$effect(() => {
		if (open) {
			const sw = window.innerWidth - document.documentElement.clientWidth;
			document.body.style.overflow = 'hidden';
			document.body.style.paddingRight = sw > 0 ? `${sw}px` : '';
		}
		return () => {
			document.body.style.overflow = '';
			document.body.style.paddingRight = '';
		};
	});

	function close() {
		menuOpenIdx = null;
		deleteTargetIdx = null;
		deletePassword = '';
		deleteError = false;
		closing = true;
		setTimeout(() => {
			document.body.style.overflow = '';
			document.body.style.paddingRight = '';
			open = false;
			closing = false;
		}, 300);
	}

	function toggleMenu(idx: number) {
		menuOpenIdx = menuOpenIdx === idx ? null : idx;
	}

	function startDelete(idx: number) {
		deleteTargetIdx = idx;
		deletePassword = '';
		deleteError = false;
		menuOpenIdx = null;
	}

	function cancelDelete() {
		deleteTargetIdx = null;
		deletePassword = '';
		deleteError = false;
	}

	async function confirmDelete() {
		if (deleteTargetIdx === null || deleting) return;
		deleting = true;
		const ok = await onDelete?.(msgs[deleteTargetIdx].id, deletePassword);
		deleting = false;
		if (ok) { cancelDelete(); } else { deleteError = true; }
	}
</script>

{#if open || closing}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="popup-stack" class:closing onclick={close}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<section class="popup-wrapper" class:closing onclick={(e) => e.stopPropagation()}>
			<div class="inner">

				<!-- 헤더 -->
				<div class="header">
					<div class="header-spacer"></div>
					<h2 class="header-title">방명록 전체보기</h2>
					<button class="close-btn" onclick={close}>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path d="M1 1L11 11M11 1L1 11" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
					</button>
				</div>

				<!-- 목록 -->
				<div class="entry-list">
					{#if msgs.length > 0}
						{#each msgs as m, i}
							<div class="entry-item">
								<div class="entry-header">
									<p class="entry-writer">{m.name}</p>
									<div class="menu-wrap">
										<button class="menu-btn" onclick={() => toggleMenu(i)}>
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
												<path d="M3.75 10C3.75 9.30964 4.30964 8.75 5 8.75C5.69036 8.75 6.25 9.30964 6.25 10C6.25 10.6904 5.69036 11.25 5 11.25C4.30964 11.25 3.75 10.6904 3.75 10Z" fill="#1D1D1D"/>
												<path d="M13.75 10C13.75 9.30964 14.3097 8.75 15 8.75C15.6904 8.75 16.25 9.30964 16.25 10C16.25 10.6904 15.6904 11.25 15 11.25C14.3097 11.25 13.75 10.6904 13.75 10Z" fill="#1D1D1D"/>
												<path d="M10 8.75C9.30965 8.75 8.75001 9.30964 8.75001 10C8.75001 10.6904 9.30965 11.25 10 11.25C10.6904 11.25 11.25 10.6904 11.25 10C11.25 9.30964 10.6904 8.75 10 8.75Z" fill="#1D1D1D"/>
											</svg>
										</button>
										{#if menuOpenIdx === i}
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<div class="menu-dropdown" onclick={(e) => e.stopPropagation()}>
												<button class="menu-item delete" onclick={() => startDelete(i)}>삭제</button>
											</div>
										{/if}
									</div>
								</div>
								<p class="entry-message">{m.text}</p>
								<div class="entry-date"><span>{m.date}</span></div>

								<!-- 비밀번호 확인 -->
								{#if deleteTargetIdx === i}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div class="delete-confirm" onclick={(e) => e.stopPropagation()}>
										<p class="delete-label">비밀번호를 입력하면 삭제됩니다.</p>
										<div class="delete-row">
											<input
												type="password"
												class="delete-input"
												placeholder="비밀번호"
												maxlength={30}
												bind:value={deletePassword}
												onkeydown={(e) => e.key === 'Enter' && confirmDelete()}
											/>
											<button class="delete-confirm-btn" onclick={confirmDelete} disabled={deleting}>
									{deleting ? '삭제 중…' : '확인'}
								</button>
											<button class="delete-cancel-btn" onclick={cancelDelete}>취소</button>
										</div>
										{#if deleteError}
											<p class="delete-error">비밀번호가 올바르지 않습니다.</p>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					{:else}
						<p class="entry-empty">아직 등록된 메시지가 없습니다.</p>
					{/if}
				</div>

			</div>
		</section>
	</div>
{/if}

<style>
	.popup-stack {
		position: fixed;
		inset: 0;
		z-index: 400;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		background: rgba(0, 0, 0, 0.35);
		animation: overlay-in 0.25s ease forwards;
	}
	.popup-stack.closing { animation: overlay-out 0.28s ease forwards; }

	.popup-wrapper {
		width: 100%;
		max-width: 425px;
		max-height: 80vh;
		background: rgba(250, 250, 250, 0.97);
		border-radius: 16px 16px 0 0;
		padding-bottom: env(safe-area-inset-bottom, 0);
		animation: slide-up 0.32s cubic-bezier(0.32, 0.72, 0, 1) forwards;
		display: flex;
		flex-direction: column;
		margin-left: unset;
	}
	@media (min-width: 768px) {
		.popup-wrapper { margin-left: -14px; }
	}
	.popup-wrapper.closing { animation: slide-down 0.30s cubic-bezier(0.32, 0.72, 0, 1) forwards; }

	@keyframes overlay-in  { from { background: rgba(0,0,0,0); }    to { background: rgba(0,0,0,0.35); } }
	@keyframes overlay-out { from { background: rgba(0,0,0,0.35); } to { background: rgba(0,0,0,0); }    }
	@keyframes slide-up    { from { transform: translateY(100%); }  to { transform: translateY(0); }     }
	@keyframes slide-down  { from { transform: translateY(0); }     to { transform: translateY(100%); }  }

	.inner {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 20px 24px 32px;
		overflow-y: auto;
		flex: 1;
	}

	/* 헤더 */
	.header {
		display: flex; align-items: center; justify-content: space-between;
		margin-bottom: 20px; flex-shrink: 0;
	}
	.header-spacer { width: 28px; }
	.header-title {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 16px; font-weight: 500; letter-spacing: .04em;
		color: #1D1D1D; margin: 0;
	}
	.close-btn {
		width: 28px; height: 28px;
		display: flex; align-items: center; justify-content: center;
		background: none; border: none; cursor: pointer; padding: 0;
	}

	/* 목록 */
	.entry-list { display: flex; flex-direction: column; }
	.entry-item {
		padding: 16px 0;
		border-bottom: 1px solid #F0F0F0;
	}
	.entry-item:last-child { border-bottom: none; }
	.entry-header {
		display: flex; align-items: center; justify-content: space-between;
		margin-bottom: 8px;
	}
	.entry-writer {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 16px; font-weight: 500; color: #1D1D1D; margin: 0;
	}
	.menu-wrap { position: relative; }
	.menu-btn {
		width: 28px; height: 28px;
		display: flex; align-items: center; justify-content: center;
		background: none; border: none; cursor: pointer; padding: 0;
	}
	.menu-dropdown {
		position: absolute; right: 0; top: 32px;
		background: #fff; border: 1px solid #E4E8EE;
		border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.1);
		z-index: 10; min-width: 80px; overflow: hidden;
	}
	.menu-item {
		display: block; width: 100%; padding: .6rem 1rem;
		background: none; border: none; cursor: pointer;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 14px; text-align: left;
		transition: background .15s;
	}
	.menu-item:hover { background: #F5F5F5; }
	.menu-item.delete { color: #E05555; }

	.entry-message {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 16px; color: #444; line-height: 1.7;
		margin: 0 0 8px; white-space: pre-line;
	}
	.entry-date span {
		font-size: 14px; color: #ABABAB;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
	}
	/* 비밀번호 확인 */
	.delete-confirm {
		margin-top: 10px; 
		padding: 12px 0;
		background: #F8F8F8;
		border-top: 1px solid #ddd9d9;
	}
	.delete-label { font-size: 13px; color: #888; margin: 0 0 8px; }
	.delete-row { display: flex; gap: 6px; }
	.delete-input {
		flex: 1; padding: .5rem .7rem;
		border: 1px solid #E4E8EE; border-radius: 6px;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 14px; outline: none;
		transition: border-color .2s;
	}
	.delete-input:focus { border-color: var(--pink); }
	.delete-confirm-btn {
		padding: .5rem .9rem; background: #E05555; color: #fff;
		border: none; border-radius: 6px; cursor: pointer;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 13px; transition: background .15s;
	}
	.delete-confirm-btn:hover { background: #c44; }
	.delete-cancel-btn {
		padding: .5rem .9rem; background: #eee; color: #555;
		border: none; border-radius: 6px; cursor: pointer;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 13px; transition: background .15s;
	}
	.delete-cancel-btn:hover { background: #ddd; }
	.delete-error { font-size: 13px; color: #E05555; margin: 6px 0 0; }

	.entry-empty {
		font-size: 14px; color: #ABABAB;
		text-align: center; padding: 2rem 0;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
	}
</style>
