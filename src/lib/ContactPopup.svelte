<script lang="ts">
	let { open = $bindable() }: { open: boolean } = $props();
	let closing = $state(false);

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

	const PHONE_SVG = `<path d="M5.79295 2.5C6.34407 2.48936 6.86292 2.71832 7.2521 3.26823C7.63872 3.81461 8.1803 4.60776 8.46955 5.35156C8.61374 5.72242 8.70459 6.10372 8.66608 6.44735C8.62587 6.80551 8.44511 7.11371 8.07811 7.30876C7.81415 7.44904 7.67292 7.64024 7.61424 7.86377C7.55355 8.09526 7.57624 8.38213 7.6826 8.71053C7.89592 9.36904 8.42458 10.1291 9.09048 10.7906C9.75578 11.4515 10.5346 11.9904 11.2251 12.2266C11.5698 12.3445 11.8784 12.3823 12.1345 12.3352C12.3836 12.2894 12.5933 12.1619 12.7518 11.9242C12.9981 11.5547 13.3124 11.3542 13.6657 11.2895C14.0101 11.2264 14.3703 11.2961 14.7118 11.4213C15.3884 11.6693 16.0792 12.1717 16.56 12.4874C17.1152 12.8519 17.4023 13.3466 17.4775 13.8859C17.5516 14.4179 17.4178 14.9772 17.1662 15.4834C16.9142 15.9906 16.5376 16.4582 16.1046 16.8119C15.6731 17.1644 15.1723 17.4146 14.6707 17.4642C11.7225 17.7554 8.75571 16.2336 6.49974 13.975C4.2432 11.7158 2.66017 8.68287 2.50478 5.88583C2.47811 5.40533 2.67574 4.87258 2.98371 4.38802C3.29422 3.8995 3.73136 3.43649 4.21824 3.09164C4.70302 2.74831 5.2545 2.51042 5.79295 2.5Z" fill="currentColor"/>`;

	const SMS_SVG = `<path d="M15.8333 3.33333C17.214 3.33333 18.3333 4.45262 18.3333 5.83333V14.1667C18.3333 15.5474 17.214 16.6667 15.8333 16.6667H4.16666C2.78594 16.6667 1.66666 15.5474 1.66666 14.1667V5.83333C1.66666 4.45262 2.78594 3.33333 4.16666 3.33333H15.8333ZM16.2284 6.8225C16.0314 6.53916 15.6418 6.46925 15.3585 6.66625L10.5953 9.97924C10.2377 10.2279 9.76304 10.2279 9.40551 9.97924L4.64232 6.66625C4.35895 6.46917 3.96946 6.53914 3.77237 6.8225C3.57529 7.10588 3.64525 7.49537 3.92862 7.69246L8.6918 11.0054C9.47838 11.5525 10.5224 11.5525 11.309 11.0054L16.0722 7.69246C16.3555 7.49535 16.4255 7.10586 16.2284 6.8225Z" fill="currentColor"/>`;

	// ─── 연락처 교체하세요 ───────────────────────────────────────
	const contacts = {
		groom: [
			{ label: '신랑',   name: '제영헌', tel: '010-2752-6756' },
			{ label: '아버지', name: '제민호', tel: '010-2626-6756' },
			{ label: '어머니', name: '김점덕', tel: '010-4437-6756' },
		],
		bride: [
			{ label: '신부',   name: '윤정서', tel: '010-9986-4110' },
			{ label: '아버지', name: '윤종수', tel: '010-7558-4110' },
			{ label: '어머니', name: '최미정', tel: '010-9908-9638' },
		],
	};
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
					<h2 class="header-title">연락하기</h2>
					<button class="close-btn" onclick={close}>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path d="M1 1L11 11M11 1L1 11" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
					</button>
				</div>

				<!-- 연락처 -->
				<div class="content-wrap">
					{#each [{ title: '신랑측', list: contacts.groom }, { title: '신부측', list: contacts.bride }] as side}
						<div class="ct-section">
							<div class="section-title"><span>{side.title}</span></div>
							{#each side.list as c}
								<div class="contact-row">
									<div class="contact-info">
										<span class="label">{c.label}</span>
										<span class="name">{c.name}</span>
									</div>
									<div class="contact-actions">
										<a href="tel:{c.tel}" class="action-btn">
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
												{@html PHONE_SVG}
											</svg>
										</a>
										<a href="sms:{c.tel}" class="action-btn">
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
												{@html SMS_SVG}
											</svg>
										</a>
									</div>
								</div>
							{/each}
						</div>
					{/each}
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
	@media (min-width: 768px) {
		.popup-stack { margin-left: -14px; }
	}
	.popup-wrapper {
		width: 100%;
		max-width: 425px;
		background: rgba(250, 250, 250, 0.97);
		border-radius: 16px 16px 0 0;
		padding-bottom: env(safe-area-inset-bottom, 0);
		animation: slide-up 0.32s cubic-bezier(0.32, 0.72, 0, 1) forwards;
	}

	.popup-stack.closing {
		animation: overlay-out 0.28s ease forwards;
	}
	.popup-wrapper.closing {
		animation: slide-down 0.30s cubic-bezier(0.32, 0.72, 0, 1) forwards;
	}

	@keyframes overlay-in {
		from { background: rgba(0, 0, 0, 0); }
		to   { background: rgba(0, 0, 0, 0.35); }
	}
	@keyframes overlay-out {
		from { background: rgba(0, 0, 0, 0.35); }
		to   { background: rgba(0, 0, 0, 0); }
	}
	@keyframes slide-up {
		from { transform: translateY(100%); }
		to   { transform: translateY(0); }
	}
	@keyframes slide-down {
		from { transform: translateY(0); }
		to   { transform: translateY(100%); }
	}
	.inner {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px 24px 32px;
	}

	/* 헤더 */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.header-spacer { width: 28px; }
	.header-title {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: .9rem;
		font-weight: 500;
		letter-spacing: .04em;
		color: #1D1D1D;
		margin: 0;
	}
	.close-btn {
		width: 28px; height: 28px;
		display: flex; align-items: center; justify-content: center;
		background: none; border: none; cursor: pointer; padding: 0;
	}

	/* 연락처 */
	.content-wrap { display: flex; flex-direction: column; gap: 20px; }
	.ct-section { display: flex; flex-direction: column; gap: 4px; }
	.section-title {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: .72rem;
		color: #888;
		letter-spacing: .06em;
		padding-bottom: 6px;
		border-bottom: 1px solid #E8E8E8;
		margin-bottom: 4px;
	}
	.contact-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 0;
		border-bottom: 1px solid #F0F0F0;
	}
	.contact-row:last-child { border-bottom: none; }
	.contact-info { display: flex; align-items: center; gap: 10px; }
	.label {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: .72rem;
		color: #999;
		min-width: 36px;
	}
	.name {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: .88rem;
		font-weight: 500;
		color: #1D1D1D;
	}
	.contact-actions { display: flex; gap: 8px; }
	.action-btn {
		width: 36px; height: 36px;
		display: flex; align-items: center; justify-content: center;
		border-radius: 50%;
		background: #F5F5F5;
		color: rgba(64, 64, 64, 0.7);
		text-decoration: none;
		transition: background .15s;
	}
	.action-btn:hover { background: #EBEBEB; }
</style>
