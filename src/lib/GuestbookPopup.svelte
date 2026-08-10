<script lang="ts">
	let {
		open = $bindable(),
		onSubmit,
	}: {
		open: boolean;
		onSubmit: (name: string, text: string, password: string) => Promise<boolean>;
	} = $props();

	let closing    = $state(false);
	let name       = $state('');
	let text       = $state('');
	let password   = $state('');
	let submitting = $state(false);
	let pwError    = $state('');

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
		closing = true;
		setTimeout(() => {
			document.body.style.overflow = '';
			document.body.style.paddingRight = '';
			open = false;
			closing = false;
		}, 300);
	}

	const WEAK_PASSWORDS = ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999'];

	async function submit() {
		if (!name.trim() || !text.trim() || !password.trim() || submitting) return;
		if (WEAK_PASSWORDS.includes(password.trim())) {
			pwError = '사용할 수 없는 비밀번호입니다.';
			return;
		}
		pwError = '';
		submitting = true;
		const ok = await onSubmit(name.trim(), text.trim(), password.trim());
		submitting = false;
		if (ok) { name = ''; text = ''; password = ''; close(); }
	}

	const canSubmit = $derived(name.trim() !== '' && text.trim() !== '' && password.trim() !== '' && !submitting);
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
					<h2 class="header-title">방명록 작성하기</h2>
					<button class="close-btn" onclick={close}>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path d="M1 1L11 11M11 1L1 11" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
					</button>
				</div>

				<!-- 폼 -->
				<div class="text-field">
					<div class="text-field-label">
						<span class="required">*</span><span>이름</span>
					</div>
					<input
						type="text"
						placeholder="이름을 입력해 주세요."
						maxlength={30}
						autocomplete="new-password"
						bind:value={name}
					/>
				</div>

				<div class="text-field">
					<div class="text-field-label">
						<span class="required">*</span><span>내용</span>
					</div>
					<textarea
						placeholder="내용을 작성해 주세요. (최대 500자)"
						maxlength={500}
						autocomplete="off"
						bind:value={text}
					></textarea>
				</div>

				<div class="text-field">
					<div class="text-field-label">
						<span class="required">*</span><span>비밀번호</span>
					</div>
					<input
						type="password"
						placeholder="비밀번호를 입력해 주세요."
						maxlength={30}
						autocomplete="new-password"
						bind:value={password}
					/>
					{#if pwError}
						<p class="pw-error">{pwError}</p>
					{/if}
				</div>

				<div class="submit-wrap">
					<button class="submit-btn" onclick={submit} disabled={!canSubmit}>
						{submitting ? '등록 중…' : '작성완료'}
					</button>
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
		background: rgba(250, 250, 250, 0.97);
		border-radius: 16px 16px 0 0;
		padding-bottom: env(safe-area-inset-bottom, 0);
		animation: slide-up 0.32s cubic-bezier(0.32, 0.72, 0, 1) forwards;
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
		gap: 20px;
		padding: 20px 24px 32px;
	}

	/* 헤더 */
	.header { display: flex; align-items: center; justify-content: space-between; }
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

	/* 폼 필드 */
	.text-field { display: flex; flex-direction: column; gap: 8px; }
	.text-field-label {
		display: flex; align-items: center; gap: 3px;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 14px; color: #1D1D1D;
	}
	.required { color: var(--pink); font-size: 14px; }
	.text-field input,
	.text-field textarea {
		width: 100%; padding: .72rem .9rem;
		border: 1px solid #E4E8EE; background: #F2F4F8;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 16px; color: #1D1D1D;
		outline: none; border-radius: 8px;
		transition: border-color .2s;
		-webkit-appearance: none;
	}
	.text-field input:focus,
	.text-field textarea:focus { border-color: var(--pink); }
	.text-field textarea { min-height: 120px; resize: none; }

	.pw-error { font-size: 13px; color: #E05555; margin: 4px 0 0; }

	/* 제출 */
	.submit-wrap { padding-top: 4px; }
	.submit-btn {
		width: 100%; padding: .85rem;
		background: #1D1D1D; color: #fff;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 16px; border: none;
		border-radius: 10px; cursor: pointer;
		transition: background .2s;
	}
	.submit-btn:hover { background: #3a3632; }
	.submit-btn:disabled { opacity: .35; cursor: not-allowed; }
</style>
