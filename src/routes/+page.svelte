<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { base } from '$app/paths';
	import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel';
	import ContactPopup from '$lib/ContactPopup.svelte';
	import NoticePopup from '$lib/NoticePopup.svelte';
	import GuestbookPopup from '$lib/GuestbookPopup.svelte';
	import GuestbookViewPopup from '$lib/GuestbookViewPopup.svelte';
	import { type Msg, fetchMsgs, writeMsgs, deleteMsgs } from '$lib/guestbook';

	const WEDDING = new Date('2026-12-12T16:00:00');

	let dday    = $state(0);
	let scroll  = $state(0);
	let toastMsg = $state('');
	let toastOn  = $state(false);
	let emblaEl: HTMLElement | null = null;
	let emblaApi: EmblaCarouselType | null = null;
	let groomOpen = $state(false);
	let brideOpen = $state(false);
	let contactOpen = $state(false);
	let gbWriteOpen   = $state(false);
	let gbViewOpen    = $state(false);
	let noticeOpen    = $state(true);
	let lbOpen  = $state(false);
	let lbIdx   = $state(0);
	let gallShowAll = $state(false);

	const GALLERY_PHOTOS = [
		{ src: `${base}/opt/gallery-01.webp`, alt: '웨딩 사진 1' },
		{ src: `${base}/opt/gallery-02.webp`, alt: '웨딩 사진 2' },
		{ src: `${base}/opt/gallery-03.webp`, alt: '웨딩 사진 3' },
		{ src: `${base}/opt/gallery-04.webp`, alt: '웨딩 사진 4' },
		{ src: `${base}/opt/gallery-05.webp`, alt: '웨딩 사진 5' },
		{ src: `${base}/opt/gallery-06.webp`, alt: '웨딩 사진 6' },
		{ src: `${base}/opt/gallery-07.webp`, alt: '웨딩 사진 7' },
		{ src: `${base}/opt/gallery-08.webp`, alt: '웨딩 사진 8' },
		{ src: `${base}/opt/gallery-09.webp`, alt: '웨딩 사진 9' },
		{ src: `${base}/opt/gallery-10.webp`, alt: '웨딩 사진 10' },
		{ src: `${base}/opt/gallery-11.webp`, alt: '웨딩 사진 11' },
		{ src: `${base}/opt/gallery-12.webp`, alt: '웨딩 사진 12' },
		{ src: `${base}/opt/gallery-13.webp`, alt: '웨딩 사진 13' },
		{ src: `${base}/opt/gallery-14.webp`, alt: '웨딩 사진 14' },
		{ src: `${base}/opt/gallery-15.webp`, alt: '웨딩 사진 15' },
		{ src: `${base}/opt/gallery-16.webp`, alt: '웨딩 사진 16' },
		{ src: `${base}/opt/gallery-17.webp`, alt: '웨딩 사진 17' },
	];
	let endingEl: HTMLElement | null = null;
	let endingRevealed = $state(false);
	let bgmEl: HTMLAudioElement | null = null;
	let bgmPlaying = $state(false);

	let msgs = $state<Msg[]>([]);

	// ─── 사진 src를 실제 경로로 교체하세요 ───────────────────────
	// 커버 사진
	const COVER_SRC  = `${base}/opt/cover_img.webp`;
	const ENDING_SRC = `${base}/opt/ending_img.webp`;
	const BGM_SRC    = `${base}/bgm.mp3`; // ← static/bgm.mp3 파일을 추가하세요
	// 신랑/신부 프로필
	const GROOM_SRC = 'https://picsum.photos/seed/groom/300/400';
	const BRIDE_SRC = 'https://picsum.photos/seed/bride/300/400';
	// 갤러리 (6장)
	const photos = [
		{ src: `${base}/opt/YOON1895.webp`, alt: '커버 사진' },      // [0]  커버
		{ src: `${base}/opt/YOON1895.webp`, alt: '2024 사진 1' },    // [1]  2024
		{ src: `${base}/opt/YOON1895.webp`, alt: '2024 사진 2' },    // [2]  2024
		{ src: `${base}/opt/YOON1895.webp`, alt: '2025 사진 1' },    // [3]  2025
		{ src: `${base}/opt/YOON1895.webp`, alt: '2025 사진 2' },    // [4]  2025
		{ src: `${base}/opt/YOON1895.webp`, alt: '2019 사진 1' },    // [5]  2019
		{ src: `${base}/opt/YOON1895.webp`, alt: '2019 사진 2' },    // [6]  2019
		{ src: `${base}/opt/YOON1895.webp`, alt: '2020 사진 1' },    // [7]  2020
		{ src: `${base}/opt/YOON1895.webp`, alt: '2020 사진 2' },    // [8]  2020
		{ src: `${base}/opt/YOON1895.webp`, alt: '2021 사진 1' },    // [9]  2021
		{ src: `${base}/opt/YOON1895.webp`, alt: '2021 사진 2' },    // [10] 2021
		{ src: `${base}/opt/YOON1895.webp`, alt: '2022 사진 1' },    // [11] 2022
		{ src: `${base}/opt/YOON1895.webp`, alt: '2022 사진 2' },    // [12] 2022
		{ src: `${base}/opt/YOON1895.webp`, alt: '2023 사진 1' },    // [13] 2023
		{ src: `${base}/opt/YOON1895.webp`, alt: '2023 사진 2' },    // [14] 2023
	];

	// ─── Our Story 내용 교체하세요 ──────────────────────────────
	// src: photos[n].src 를 실제 사진 경로로, title·desc 를 실제 내용으로 교체하세요.
	type StorySlide =
		| { type: 'year'; year: number }
		| { type: 'content'; src: string; alt: string; title: string; desc: string };
	const storySlides: StorySlide[] = [
		{ type: 'year', year: 2019 },
		{ type: 'content', src: photos[5].src, alt: photos[5].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'content', src: photos[6].src, alt: photos[6].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'year', year: 2020 },
		{ type: 'content', src: photos[7].src, alt: photos[7].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'content', src: photos[8].src, alt: photos[8].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'year', year: 2021 },
		{ type: 'content', src: photos[9].src, alt: photos[9].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'content', src: photos[10].src, alt: photos[10].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'year', year: 2022 },
		{ type: 'content', src: photos[11].src, alt: photos[11].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'content', src: photos[12].src, alt: photos[12].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'year', year: 2023 },
		{ type: 'content', src: photos[13].src, alt: photos[13].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'content', src: photos[14].src, alt: photos[14].alt, title: '제목을 입력해주세요', desc: '이 곳에 내용을 입력해주세요.' },
		{ type: 'year', year: 2024 },
		{ type: 'content', src: photos[1].src, alt: photos[1].alt, title: '함께 있으면 편안했습니다', desc: '특별한 이유 없이도\n함께하는 시간이 좋았고,\n마음이 차분해졌습니다.' },
		{ type: 'content', src: photos[2].src, alt: photos[2].alt, title: '서로의 하루에 스며들다', desc: '어느 순간부터\n서로의 일상에 자연스럽게 스며들었고,\n함께하는 시간이 늘어났습니다.' },
		{ type: 'year', year: 2025 },
		{ type: 'content', src: photos[3].src, alt: photos[3].alt, title: '가장 편안한 사람이 되었습니다', desc: '특별한 순간보다\n함께하는 평범한 하루가 더 좋았고,\n서로에게 익숙해졌습니다.' },
		{ type: 'content', src: photos[4].src, alt: photos[4].alt, title: '이 사람과 함께라면', desc: '조용히 쌓여온 시간 속에서\n이 사람과 함께라면\n괜찮겠다는 마음이 들었습니다.' },
	];

	// Dec 2026: 1일 = 화요일
	const calRows = [
		[null, null, 1,  2,  3,  4,  5 ],
		[6,    7,    8,  9,  10, 11, 12],
		[13,   14,   15, 16, 17, 18, 19],
		[20,   21,   22, 23, 24, 25, 26],
		[27,   28,   29, 30, 31, null, null],
	];

	// ─── 계좌번호 교체하세요 ─────────────────────────────────────
	const accounts = {
		groom: [
			{ label: '신랑 제영헌', 	bank: '-',  num: '-', },
			{ label: '아버지 제민호', bank: '-',  num: '-', },
			{ label: '어머니 김점덕', bank: '-',  num: '-', },
		],
		bride: [
			{ label: '신부 윤정서',   bank: '-',  num: '-', },
			{ label: '아버지 윤종수', bank: '-',  num: '-', },
			{ label: '어머니 최미정', bank: '-',  num: '-', },
		],
	};

	onMount(() => {
		const today = new Date(); today.setHours(0, 0, 0, 0);
		const weddingDay = new Date(2026, 11, 12); // 자정 기준
		dday = Math.round((weddingDay.getTime() - today.getTime()) / 86400000);


		const onScroll = () => {
			const el = document.documentElement;
			scroll = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
		};
		window.addEventListener('scroll', onScroll, { passive: true });

		const obs = new IntersectionObserver(
			(entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('on'); }),
			{ threshold: 0.07 }
		);
		document.querySelectorAll('.fi').forEach((el) => obs.observe(el));

		if (emblaEl) emblaApi = EmblaCarousel(emblaEl, { loop: false, align: 'start', dragFree: true });

		if (bgmEl) {
			bgmEl.play().then(() => { bgmPlaying = true; }).catch(() => { bgmPlaying = false; });
		}

		const endingObs = new IntersectionObserver(
			([e]) => { endingRevealed = e.isIntersecting; },
			{ threshold: 0.3 }
		);
		if (endingEl) endingObs.observe(endingEl);

		// 카카오 지도 퍼가기
		const mapEl = document.getElementById('daumRoughmapContainer1781581063326');
		const mapBox = mapEl?.parentElement as HTMLElement | null;
		const mapW = mapBox?.clientWidth || 640;
		const mapH = Math.round(mapW * 360 / 640);
		if (mapBox) mapBox.style.height = mapH + 'px';
		new (window as any).daum.roughmap.Lander({
			timestamp: '1781581063326',
			key: '2r2v6cdrog2h',
			mapWidth: String(mapW),
			mapHeight: String(mapH)
		}).render();

		return () => { window.removeEventListener('scroll', onScroll); obs.disconnect(); emblaApi?.destroy(); endingObs.disconnect(); };
	});

	function toast(m: string) { toastMsg = m; toastOn = true; setTimeout(() => (toastOn = false), 2000); }
	async function copy(text: string, label: string) {
		try { await navigator.clipboard.writeText(text); toast(`${label} 복사됨`); }
		catch { toast('복사 실패'); }
	}
	async function loadMsgs() {
		try {
			msgs = await fetchMsgs();
		} catch {
			toast('방명록을 불러오는데 실패했습니다.');
		}
	}
	async function addMsg(name: string, text: string, password: string): Promise<boolean> {
		try {
			await writeMsgs(name, text, password);
			toast('메시지가 등록되었습니다 ♡');
			await loadMsgs();
			return true;
		} catch {
			toast('등록에 실패했습니다. 다시 시도해 주세요.');
			return false;
		}
	}
	async function deleteMsg(id: number, password: string): Promise<boolean> {
		try {
			await deleteMsgs(id, password);
			await new Promise<void>(resolve => setTimeout(resolve, 1500));
			await loadMsgs();
			return !msgs.some(m => m.id === id);
		} catch {
			return false;
		}
	}
	async function shareLink() {
		if (navigator.share) await navigator.share({ title: '제영헌 ♥ 윤정서 결혼합니다', url: location.href });
		else await copy(location.href, '링크');
	}
	function toggleBgm() {
		if (!bgmEl) return;
		if (bgmPlaying) { bgmEl.pause(); bgmPlaying = false; }
		else { bgmEl.play(); bgmPlaying = true; }
	}
	$effect(() => {
		const sw = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = lbOpen ? 'hidden' : '';
		document.body.style.paddingRight = lbOpen && sw > 0 ? `${sw}px` : '';
		const vp = document.querySelector('meta[name="viewport"]');
		if (vp) vp.setAttribute('content', lbOpen
			? 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
			: 'width=device-width, initial-scale=1');
		return () => {
			document.body.style.overflow = '';
			document.body.style.paddingRight = '';
			vp?.setAttribute('content', 'width=device-width, initial-scale=1');
		};
	});

	function openLb(i: number) { lbIdx = i; lbOpen = true; }
	function lbPrev() { lbIdx = (lbIdx - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length; }
	function lbNext() { lbIdx = (lbIdx + 1) % GALLERY_PHOTOS.length; }
	function scrollToStory() {
		emblaApi?.scrollTo(1);
	}
</script>

<audio bind:this={bgmEl} src={BGM_SRC} loop preload="auto"></audio>

<div class="wrap">
<div id="scroll-progress" style="width:{scroll}%"></div>

<button class="bgm-btn" onclick={toggleBgm} aria-label="배경음악 재생/정지">
	{#if bgmPlaying}
		<!-- 재생 중: 스피커 + 음파 -->
		<svg class="bgm-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
			<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
			<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
		</svg>
	{:else}
		<!-- 정지: 스피커 뮤트 -->
		<svg class="bgm-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
			<line x1="23" y1="9" x2="17" y2="15"/>
			<line x1="17" y1="9" x2="23" y2="15"/>
		</svg>
	{/if}
</button>

<!-- ═══════════════════════════════════════════════════════════
     1. COVER  —  흰 배경 + 타이포 + 인셋 사진
═══════════════════════════════════════════════════════════ -->
<section class="cover">
	<div class="cover-inner">
		<!-- 스크립트 타이틀 -->
		<div class="cover-title-wrap fi">

			<div class="cover-script-wrap">
				<span class="cover-script">Better</span>
				<span class="cover-script">Together</span>
			</div>

			<!-- 인셋 사진: 실제 커버 사진으로 교체 -->
			<div class="cover-inset">
				<div class="cover-photo-wrap">
					<img src={COVER_SRC} alt="커버 사진" />
					<div class="deco-line" style="color: var(--pink)">
						<svg class="deco-line-img" xmlns="http://www.w3.org/2000/svg" width="242" height="325" viewBox="0 0 242 325" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M60.6654 5.97093C69.2848 -0.993543 79.7116 -1.66051 91.956 2.90324C104.089 7.42554 118.205 17.1406 134.614 31.2631C146.411 37.0941 155.319 39.2942 163.779 38.9796C172.31 38.6623 180.552 35.7856 191.05 31.1518C213.082 21.4267 228.402 23.901 235.777 33.59C243.039 43.1315 241.8 58.7377 232.894 73.5094C225.55 85.692 217.724 99.8652 214.596 114.13C211.485 128.319 213.04 142.477 224.325 154.89C237.53 169.416 242.113 185.115 240.797 201.66C239.488 218.124 232.345 235.343 222.291 253.032C215.725 264.583 220.226 277.212 225.769 289.001C228.478 294.763 231.473 300.396 233.175 305.249C234.863 310.06 235.543 314.787 232.81 318.441C228.848 323.738 223.156 324.877 216.979 324.136C210.881 323.404 203.973 320.809 197.163 318.285C190.255 315.726 183.406 313.223 177.133 312.43C170.909 311.643 165.499 312.569 161.242 316.614C157.027 320.618 152.865 322.826 148.491 323.703C144.141 324.574 139.715 324.1 135.023 322.97C130.354 321.845 125.274 320.029 119.665 318.142C114.022 316.244 107.756 314.242 100.573 312.675C87.8477 309.9 80.2424 308.944 71.9609 309.902C63.6099 310.868 54.5025 313.785 38.7551 318.972C30.7449 321.61 23.7797 322.204 18.1206 320.773C12.4031 319.326 8.12598 315.835 5.56513 310.58C3.03073 305.378 2.22022 298.549 3.1496 290.41C4.08057 282.258 6.76868 272.69 11.3498 261.92C18.335 245.499 21.1323 234.047 20.8327 223.661C20.533 213.276 17.135 203.787 11.3675 191.257C5.51549 178.543 3.37354 168.826 4.2155 158.943C5.05183 149.127 8.82513 139.291 14.4717 126.375C25.0153 102.259 20.7094 81.8013 6.03996 48.6713C3.60181 43.1649 1.6962 36.9959 0.720267 31.1607C-0.250066 25.3585 -0.328606 19.7305 1.03354 15.3897C1.71985 13.2027 2.79394 11.2741 4.37017 9.83657C5.96385 8.38321 7.98921 7.50849 10.4238 7.31661C15.1943 6.94073 21.4897 9.18401 29.5717 14.5652C35.817 18.7234 40.03 20.7814 43.0227 21.4867C44.4939 21.8334 45.612 21.8381 46.5032 21.6453C47.3834 21.4548 48.1345 21.052 48.8507 20.4425C50.3874 19.1346 51.5881 17.0782 53.3951 14.3416C55.1386 11.7012 57.3131 8.67954 60.6654 5.97093ZM90.899 5.73942C79.3247 1.42546 70.1113 2.2283 62.5667 8.3244C59.5794 10.7382 57.6101 13.4513 55.921 16.0094C54.2955 18.4711 52.7738 21.0771 50.8121 22.7467C49.7791 23.6258 48.5864 24.2904 47.1435 24.6027C45.7116 24.9126 44.1262 24.8557 42.3292 24.4322C38.7845 23.597 34.1974 21.281 27.8941 17.0842C19.9578 11.8001 14.384 10.0397 10.6612 10.3331C8.84938 10.4759 7.47164 11.1041 6.40939 12.0728C5.32966 13.0575 4.49377 14.4707 3.92095 16.2961C2.76486 19.9803 2.76875 25.0616 3.70521 30.6612C4.63612 36.2275 6.46259 42.1539 8.8062 47.4468C23.561 80.7695 28.3193 102.257 17.2448 127.588C11.5895 140.524 8.01985 149.941 7.23098 159.2C6.44789 168.392 8.399 177.571 14.116 189.992C19.9178 202.597 23.5398 212.549 23.858 223.573C24.1761 234.596 21.1889 246.52 14.1338 263.105C9.63155 273.689 7.04523 282.969 6.15621 290.753C5.26572 298.55 6.08929 304.746 8.28606 309.255C10.4566 313.709 14.0095 316.611 18.8624 317.839C23.7738 319.081 30.1211 318.63 37.8084 316.097C53.4561 310.943 62.8894 307.906 71.6131 306.896C80.4064 305.879 88.4111 306.925 101.218 309.718C108.566 311.32 114.956 313.365 120.629 315.273C126.335 317.192 131.231 318.943 135.732 320.027C140.21 321.106 144.15 321.485 147.896 320.734C151.616 319.989 155.281 318.102 159.158 314.42C164.315 309.52 170.781 308.576 177.512 309.427C184.195 310.272 191.383 312.916 198.214 315.447C205.142 318.014 211.675 320.452 217.339 321.131C222.924 321.801 227.319 320.73 230.386 316.628C232.127 314.301 231.969 310.954 230.319 306.251C228.685 301.591 225.843 296.27 223.03 290.289C217.531 278.593 212.246 264.579 219.659 251.537C229.633 233.989 236.523 217.229 237.781 201.42C239.032 185.69 234.716 170.819 222.086 156.925C209.973 143.601 208.378 128.355 211.639 113.482C214.884 98.6846 222.954 84.1369 230.303 71.947C238.918 57.6568 239.54 43.5296 233.369 35.4223C227.311 27.463 213.901 24.3726 192.272 33.92C181.715 38.5796 173.03 41.6631 163.891 42.003C154.719 42.344 145.255 39.92 133.103 33.8924L132.932 33.8077L132.788 33.6826C116.381 19.5473 102.548 10.0813 90.899 5.73942Z" fill="currentColor"/></svg>
					</div>
				</div>
			</div>
		</div>

		<div class="cover-info fi d2">
			<p class="cover-lorem wedding-text">Wedding Invitation</p>
			<p class="wedding-text">Je Yeongheon &amp; Yun JeongSeo</p>
			<p class="cover-date-txt wedding-text">2026.12.12 04:00PM</p>
		</div>
	</div>

</section>

<!-- ═══════════════════════════════════════════════════════════
     2. 인사말
═══════════════════════════════════════════════════════════ -->
<section class="sec inv-sec">

	<!-- 헤더: 영문 레이블 + 한글 타이틀 -->
	<div class="inv-header fi">
		<span class="lbl">INVITATION</span>
		<p class="ko-title">소중한 분들을 초대합니다</p>
	</div>

	<!-- 본문 -->
	<div class="inv-body fi d1">
		<div class="description-wrapper">
			<p class="invite-body">
				햇살처럼 따뜻하게 안아줄 수 있는<br />
				늘 곁에서 서로를 웃게 해줄 수 있는<br />
				소중한 사람을 만났습니다.<br /><br />
				기쁜 날, 가까이에서 축복해 주시면<br />
				더없는 기쁨으로 간직하겠습니다.
			</p>
		</div>
	</div>

	<!-- 푸터: 구분선 + 가족 소개 + 연락하기 -->
	<div class="inv-footer fi d2">
		<div class="division-line"></div>
		<div class="intro-bottom">
			<div class="family-row">
				<span class="person-name">제민호·김점덕</span>
				<span class="parent-of">의&nbsp;&nbsp;차남</span>
				<span class="person-name">제영헌</span>
			</div>
			<div class="family-row">
				<span class="person-name">윤종수·최미정</span>
				<span class="parent-of">의&nbsp;&nbsp;장녀</span>
				<span class="person-name">윤정서</span>
			</div>
		</div>
		<button class="btn-contact" onclick={() => (contactOpen = true)}>
			<svg width="14" height="14" viewBox="0 0 48 48" fill="currentColor">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M14.454 5.99025C16.0414 5.95963 17.5385 6.63998 18.6171 8.16407C19.4866 9.39287 20.7861 11.2845 21.4931 13.1025C21.8439 14.0046 22.1163 15.0514 22.0019 16.0713C21.8757 17.196 21.2823 18.2036 20.1308 18.8154C19.771 19.0066 19.6483 19.2129 19.5927 19.4248C19.5222 19.6937 19.5264 20.1307 19.7314 20.7637C20.1452 22.0415 21.222 23.6261 22.666 25.0606C24.1053 26.4903 25.739 27.6016 27.1064 28.0693C27.7864 28.302 28.2988 28.3405 28.6474 28.2764C28.9456 28.2214 29.175 28.0869 29.3749 27.7871C30.0745 26.7378 31.0189 26.11 32.1142 25.9092C33.1461 25.7201 34.1608 25.9372 35.0224 26.2529C36.6986 26.8673 38.403 28.1061 39.4179 28.7725C40.9201 29.7587 41.7376 31.1401 41.9492 32.6582C42.1532 34.1232 41.7804 35.5999 41.1474 36.874C40.5105 38.1558 39.5642 39.3299 38.4726 40.2217C37.3917 41.1046 36.0726 41.7869 34.6767 41.9248C27.5854 42.6253 20.582 38.9681 15.3476 33.7276C10.1083 28.4821 6.37094 21.3889 6.00189 14.7412C5.92494 13.3532 6.49007 11.9316 7.24603 10.7422C8.02026 9.52413 9.10203 8.37717 10.3144 7.51857C11.5112 6.67101 12.9581 6.01923 14.454 5.99025Z"/>
			</svg>
			연락하기
		</button>
	</div>

</section>


<!-- ═══════════════════════════════════════════════════════════
4. 예식 일시
═══════════════════════════════════════════════════════════ -->
<section class="sec" style="text-align:center">

	<div class="calendar-wrap">

		<div class="fi d1">
			<p class="dt-main">2026. 12.12</p>
			<p class="dt-sub">토요일 오후 4시</p>
		</div>
	
		<div class="dday-box fi d2">
			{#if dday > 0}
				<span class="dd-d">D</span><span class="dd-dash">-</span><span class="dd-num">{dday}</span>
			{:else if dday === 0}
				<span class="dd-d">D-Day</span>
			{:else}
				<span class="dd-d">+{Math.abs(dday)}</span>
			{/if}
		</div>
	
		<hr class="hr-sm fi d2" />
	
		<div class="fi d3">
			<div class="cal-grid">
				{#each ['일','월','화','수','목','금','토'] as h, i}
					<div class="cal-head" class:sun={i===0} class:sat={i===6}>{h}</div>
				{/each}
				{#each calRows as row}
					{#each row as d, ci}
						<div class="cal-cell" class:sun={ci===0} class:sat={ci===6} class:wd={d===12}>
							{#if d===12}<span>{d}</span>{:else}{d??''}{/if}
						</div>
					{/each}
				{/each}
			</div>
		</div>

	</div>

</section>


<!-- ═══════════════════════════════════════════════════════════
     5. 예식장 위치
═══════════════════════════════════════════════════════════ -->
<section class="sec loc-sec">

	<!-- 헤더 -->
	<div class="inv-header fi">
		<span class="lbl">LOCATION</span>
		<p class="ko-title">오시는 길</p>
	</div>

	<!-- 장소 정보 -->
	<div class="loc-info fi d1">
		<p class="hall-name">벡스코 W웨딩홀</p>
		<p class="loc-detail">제 1전시장 지하 1층 · 단독홀</p>
		<p class="loc-address">부산 해운대구 APEC로 55</p>
		<a href="tel:051-740-8888" class="loc-tel">Tel. 051-740-8888</a>
	</div>

	<!-- 지도 -->
	<div class="map-box fi d2">
		<div id="daumRoughmapContainer1781581063326" class="root_daum_roughmap root_daum_roughmap_landing"></div>
	</div>

	<!-- 내비게이션 -->
	<div class="navigation fi d2">
		<p class="navi-title">내비게이션</p>
		<p class="navi-desc">원하시는 앱을 선택하시면 길안내가 시작됩니다.</p>
		<div class="navi-btns">
			<a href="https://map.naver.com/v5/search/벡스코" target="_blank" rel="noopener" class="navi-btn naver">네이버지도</a>
			<a href="tmap://route?rGoName=벡스코&rGoX=129.1357&rGoY=35.1679" class="navi-btn tmap">티맵</a>
			<a href="https://map.kakao.com/link/map/벡스코,35.1679,129.1357" target="_blank" rel="noopener" class="navi-btn kakao">카카오내비</a>
		</div>
	</div>

	<!-- 교통 정보 -->
	<ul class="tp-list fi d3">
		<li class="tp-item">
			<span class="tp-title">지하철</span>
			<div class="tp-content">
				<p>동해선 BEXCO역 1번 출구 도보 3분</p>
				<p>2호선 센텀시티역 1번 출구 도보 1분</p>
				<p>2호선 벡스코(시립미술관)역 9번 출구 도보 1분</p>
			</div>
		</li>
		<li class="tp-item">
			<span class="tp-title">버스</span>
			<div class="tp-content">
				<p>간선버스 : 39, 40, 63, 139, 141, 1002번 등</p>
				<p>BEXCO 정류장 하차</p>
			</div>
		</li>
		<li class="tp-item">
			<span class="tp-title">자가용</span>
			<div class="tp-content">
				<p>벡스코 제 1, 2전시장 주차장 이용</p>
				<p>행사 당일 혼잡 예상</p>
			</div>
		</li>
	</ul>

</section>


<!-- ═══════════════════════════════════════════════════════════
     6. 식사 안내
═══════════════════════════════════════════════════════════ -->
<section class="sec meal-sec">

	<div class="inv-header fi">
		<span class="lbl">MEAL</span>
		<p class="ko-title">식사 안내</p>
	</div>

	<div class="meal-info fi d1">
		<p class="meal-place">예식 후 벡스코 지하 1층 더파티에<br />식사가 준비되어 있습니다.</p>
		<p class="meal-desc">
			귀한 걸음 해주신 만큼<br />
			맛있는 식사와 함께 따뜻한 시간 보내고 가세요.<br />
			참석해 주셔서 진심으로 감사드립니다.
		</p>
	</div>

</section>


<!-- ═══════════════════════════════════════════════════════════
     7. Our Story 타임라인
═══════════════════════════════════════════════════════════ -->
<section class="sec-timeline" style="display:none">
	<div class="tl-viewport" bind:this={emblaEl}>
		<div class="tl-container">
			<!-- 커버 슬라이드 -->
			<div class="tl-cover">
				<p class="tl-cover-script">Our Story</p>
				<div class="tl-cover-img">
					<img src={photos[0].src} alt="Our Story" />
				</div>
				<div class="tl-cover-years">
					<span class="tl-year-lbl">2019</span>
					<span class="tl-year-line"></span>
					<span class="tl-year-lbl">2026</span>
				</div>
				<button class="tl-arrow" onclick={scrollToStory}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="28" viewBox="0 0 16 28" fill="none">
						<path d="M3 2L13 14L3 26" stroke="#404040" stroke-opacity="0.45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

			{#each storySlides as slide}
				{#if slide.type === 'year'}
					<div class="tl-year-row">
						<span class="tl-year-badge">{slide.year}</span>
					</div>
				{:else}
					<div class="tl-item">
						<div class="tl-item-img">
							<img src={slide.src} alt={slide.alt} loading="lazy" />
						</div>
						<div class="tl-item-info">
							<p class="tl-item-title">{slide.title}</p>
							<p class="tl-item-desc">{slide.desc}</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>


<!-- ═══════════════════════════════════════════════════════════
     8. 갤러리
═══════════════════════════════════════════════════════════ -->
<section class="sec gall-sec">

	<div class="inv-header fi">
		<span class="lbl">GALLERY</span>
		<p class="ko-title">웨딩 갤러리</p>
	</div>

	<div class="gall-grid fi d1">
		{#each (gallShowAll ? GALLERY_PHOTOS : GALLERY_PHOTOS.slice(0, 6)) as p, i}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="gall-item"
				style="background-image: url('{p.src}')"
				onclick={() => openLb(i)}
			></div>
		{/each}
	</div>

	{#if !gallShowAll && GALLERY_PHOTOS.length > 6}
		<div class="gall-more-wrap fi d2">
			<button class="gall-more-btn" onclick={() => (gallShowAll = true)}>
				더보기
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
					<path d="M10.235 3.485a.375.375 0 0 1 .53.53L6.265 8.515a.375.375 0 0 1-.53 0L1.235 4.015a.375.375 0 0 1 .53-.53L6 7.72l4.235-4.235Z" fill="currentColor"/>
				</svg>
			</button>
		</div>
	{/if}

</section>

<!-- 라이트박스 -->
{#if lbOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="lb-ov" onclick={() => (lbOpen = false)}>
		<button class="lb-close" onclick={() => (lbOpen = false)}>✕</button>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="lb-img-wrap" onclick={(e) => e.stopPropagation()}>
			<img src={GALLERY_PHOTOS[lbIdx].src} alt={GALLERY_PHOTOS[lbIdx].alt} />
		</div>
		<button class="lb-arr lb-prev" onclick={(e) => { e.stopPropagation(); lbPrev(); }}>‹</button>
		<button class="lb-arr lb-next" onclick={(e) => { e.stopPropagation(); lbNext(); }}>›</button>
	</div>
{/if}

<!-- ═══════════════════════════════════════════════════════════
     9. 방명록
═══════════════════════════════════════════════════════════ -->
<section class="sec gb-sec">

	<!-- 헤더 -->
	<div class="inv-header fi">
		<span class="lbl">GUESTBOOK</span>
		<p class="ko-title">방명록</p>
	</div>

	<!-- 안내 문구 + 버튼 -->
	<div class="gb-container fi d1">
		<p class="gb-note">신랑, 신부에게<br />축하하는 글을 남겨보세요.</p>
		<div class="gb-tools">
			<button class="gb-btn" onclick={() => (gbWriteOpen = true)}>
				방명록 작성하기
			</button>
			<button class="gb-btn" onclick={() => { gbViewOpen = true; loadMsgs(); }}>
				방명록 전체보기
			</button>
		</div>
	</div>




</section>


<!-- ═══════════════════════════════════════════════════════════
     10. 마음 전하실 곳
═══════════════════════════════════════════════════════════ -->
<section class="acc-sec" style="display:none">

	<!-- 헤더 + 설명 -->
	<div class="acc-top fi">
		<div class="inv-header">
			<span class="lbl">ACCOUNT</span>
			<p class="ko-title">마음 전하실 곳</p>
		</div>
		<p class="acc-description">
			참석이 어려우신 분들을 위해<br />
			계좌번호를 기재하였습니다.<br />
			너그러운 마음으로 양해 부탁드립니다.
		</p>
	</div>

	<!-- 아코디언 -->
	<div class="acc-body-wrap fi d1">
		<div class="acc-panel" style="border-top:1px solid var(--line)">
			<button class="acc-head" onclick={() => (groomOpen = !groomOpen)}>
				신랑측 혼주 <span class="chevron" class:open={groomOpen}>▾</span>
			</button>
			{#if groomOpen}
				<div class="acc-body" transition:slide={{ duration: 250 }}>
					{#each accounts.groom as a}
						<div class="acc-row">
							<div>
								<p style="font-size:.68rem;color:var(--muted);margin-bottom:2px;text-align:left;">{a.label} · {a.bank}</p>
								<p class="acc-num">{a.num}</p>
							</div>
							<button class="btn-ghost" style="font-size:.66rem;padding:.32rem .7rem" onclick={() => copy(a.num, a.label)}>복사</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div class="acc-panel">
			<button class="acc-head" onclick={() => (brideOpen = !brideOpen)}>
				신부측 혼주 <span class="chevron" class:open={brideOpen}>▾</span>
			</button>
			{#if brideOpen}
				<div class="acc-body" transition:slide={{ duration: 250 }}>
					{#each accounts.bride as a}
						<div class="acc-row">
							<div>
								<p style="font-size:.68rem;color:var(--muted);margin-bottom:2px;text-align:left;">{a.label} · {a.bank}</p>
								<p class="acc-num">{a.num}</p>
							</div>
							<button class="btn-ghost" style="font-size:.66rem;padding:.32rem .7rem" onclick={() => copy(a.num, a.label)}>복사</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

</section>


<!-- ═══════════════════════════════════════════════════════════
     11. 엔딩 (공유 + Footer)
═══════════════════════════════════════════════════════════ -->
<div class="ending-area">

	<!-- 엔딩 사진 + 텍스트 오버레이 -->
	<div class="ending-photo" bind:this={endingEl}>
		<img src={ENDING_SRC} alt="엔딩 사진" />
		<div class="ending-text" class:revealed={endingRevealed}>
			<div class="ending-text-content" class:visible={endingRevealed}>
				<p class="ending-poem-body">예쁜 예감이 들었다.<br>우리는 언제나<br>손을 잡고 있게 될 것이다.</p>
				<p class="ending-poem-title">&lt;연인, 이이체&gt;</p>
				<p class="ending-names">제영헌 &amp; 윤정서</p>
				<p class="ending-date">2026 · 12 · 12</p>
			</div>
		</div>
	</div>

	<!-- 공유 버튼 -->
	<div class="share-kakao-wrap">
		<button class="kkt-share" onclick={shareLink}>
			<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 3C6.477 3 2 6.477 2 10.667c0 2.623 1.447 4.947 3.666 6.399L4.5 21l4.383-2.321C9.893 18.88 10.934 19 12 19c5.523 0 10-3.477 10-8.333S17.523 3 12 3z"/>
			</svg>
			카카오톡으로 초대장 보내기
		</button>
		<button class="btn-link2" onclick={shareLink}>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
				<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
			</svg>
			링크 복사
		</button>
	</div>

	<!-- 카피라이트 -->
	<p class="ending-copyright">Copyright©pengKku All rights reserved.</p>

</div>

<div class="toast" class:show={toastOn}>{toastMsg}</div>

<NoticePopup bind:open={noticeOpen} />
<ContactPopup bind:open={contactOpen} />
<GuestbookPopup bind:open={gbWriteOpen} onSubmit={addMsg} />
<GuestbookViewPopup bind:open={gbViewOpen} {msgs} onDelete={deleteMsg} />
</div>

<style>
	/* ── Cover ──────────────────────────────────────────────── */
	.cover {
		aspect-ratio: 393 / 590;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 20px;
		padding: 32px 24px;
		/* background: linear-gradient(165deg, #EBF3FC 0%, #F6F0EC 55%, #FBF8F5 100%); */
		position: relative;
	}
	.cover-inner { width: 100%; }

	.cover-title-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(36px, 18vw, 70px);
	}

	.cover-script-wrap {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-top: -12px
	}
	.cover-script {
		font-family: 'Playfair Display', serif;
		font-size: clamp(2.8rem, 18.5vw, 4.7rem);
		font-weight: 800;
		color: var(--pink);
		line-height: .9;
		letter-spacing: -0.3px;
	}

	/* 인셋 사진 */
	.cover-inset {
		box-sizing: border-box;
		flex-shrink: 0;
		padding: 0 20px;
		position: relative;
		width: 100%;
	}
	.cover-photo-wrap {
		aspect-ratio: 209 / 278.67;
		width: 100%;
		position: relative;
	}
	.cover-photo-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
	.deco-line {
		aspect-ratio: 231.01 / 314.34;
		bottom: -8.08%;
		left: 50%;
		pointer-events: none;
		position: absolute;
		top: -8.31%;
		transform: translateX(-50%);
	}
	.deco-line-img {
		width: 100%;
		height: 100%;
	}

	.cover-info {
		text-align: center;
		margin-top: clamp(20px, 10vw, 40px);
		letter-spacing: -.5px;
	}

	.wedding-text {
		width: 100%;
		font-family: 'Noto Serif', serif;
		font-weight: 500;
		color: #121212;
		margin: 0;
		font-size: clamp(13px, 4vw, 16px);
		line-height: clamp(20px, 6vw, 24px);
	}

	.cover-lorem {
		font-size: 12px;
		line-height: 18px;
		margin-bottom: 6px;
		color: #f8b6c7;
	}
	.cover-name-kr {
		font-family: 'Noto Serif KR', serif;
		font-size: 1.5rem; font-weight: 400; letter-spacing: .18em;
	}
	.cover-heart { color: var(--pink); font-size: .9rem; }

	.cover-rule { border: none; border-top: 1px solid var(--line); margin: .9rem auto; width: 60px; }
	.cover-date-txt {
		font-family: 'Noto Serif KR', serif;
		font-size: .78rem; color: var(--sub);
		margin-bottom: .3rem;
	}
	.cover-venue-txt {
		font-family: 'TmoneyRoundWind', sans-serif;
		font-size: .65rem; color: var(--muted); letter-spacing: .1em;
	}

	/* ── Invitation ─────────────────────────────────────────── */
	.inv-sec {
		text-align: center;
		background-color: #fffefe;
	}
	.inv-header { margin-bottom: 1.6rem; }
	.ko-title {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: clamp(17px, 5vw, 20px); font-weight: 500; letter-spacing: .04em;
		margin-top: .5rem; color: var(--text);
	}
	.inv-body { margin-bottom: 1.6rem; }
	.description-wrapper { max-width: 290px; margin: 0 auto; }
	.invite-body {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: clamp(.875rem, 4vw, 1rem);
		line-height: 1.8;
		color: var(--sub);
		letter-spacing: -.5px;
	}
	.division-line {
		border-top: 1px solid #c5cdd9;
		margin: 2.2rem auto;
		width: 48px;
	}
	.intro-bottom {
		display: flex; flex-direction: column; gap: .55rem;
		margin-bottom: 1.6rem;
		color: var(--sub);
	}
	.family-row {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
	}
	.parent-of {
		color: var(--muted);
		margin-right: 10px;
	}
	.person-name { font-weight: 500; color: var(--text); }
	.btn-contact {
		width: 200px;
		display: flex; align-items: center; justify-content: center;
		gap: 8px;
		background: #ffffff;
		border: 1px solid var(--line);
		border-radius: 12px;
		color: var(--text);
		cursor: pointer;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 1rem;
		line-height: 2.5rem;
		padding: 4px 22px;
		text-decoration: none;
		transition: background .2s, color .2s;
		margin: 0 auto;
	}
	.btn-contact:hover { background: var(--line); }

	/* ── Date ───────────────────────────────────────────────── */
.calendar-wrap {
	width: min(305px, 100%);
	margin: 0 auto;
}

	.dt-main {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: clamp(17px, 5vw, 20px); font-weight: 500; letter-spacing: -.5px; margin: 0 0 .3rem;
	}
	.dt-sub { font-family: TmoneyRoundWind, 'Noto Serif KR', serif; font-size: clamp(14px, 4vw, 16px); color: var(--sub); }
	.dday-box {
		display: inline-flex; align-items: center; justify-content: center;
		gap: 4px;
		background: #ffffff;
		border: 1px solid var(--line);
		border-radius: 12px;
		color: var(--text);
		font-size: 1.4rem;
		line-height: 2.5rem;
		min-width: 190px;
		padding: 10px 22px;
		margin: 1.4rem 0 0;
		cursor: default;
	}
	.dd-d { font-family: TmoneyRoundWind, 'Noto Serif KR', serif; font-size: 16px; color: var(--pink); letter-spacing: .08em; }
	.dd-dash { font-family: TmoneyRoundWind, 'Noto Serif KR', serif; font-size: 16px; color: var(--pink); }
	.dd-num { font-family: TmoneyRoundWind, 'Noto Serif KR', serif; font-size: 2rem; font-weight: 700; color: var(--text); line-height: 1; }


	/* ── Venue ──────────────────────────────────────────────── */
	/* ── Location ───────────────────────────────────────────── */
	.loc-sec { text-align: center; }
	.loc-info { margin: 1.6rem 0; }
	.hall-name { font-size: clamp(17px, 5vw, 20px); font-weight: 500; margin-bottom: 14px; }
	.loc-detail { font-size: 14px; color: var(--sub); margin-bottom: 2px; }
	.loc-address { font-size: 14px; color: var(--muted); margin-bottom: 18px; }
	.loc-tel { font-size: 16px; color: var(--text); text-decoration: none; }

	.navigation {
		margin-top: 1rem;
		text-align: left;
	}
	.navi-title { font-size: 16px; font-weight: 500; margin-bottom: .3rem; color: #121212; }
	.navi-desc { font-size: 14px; color: var(--sub); margin-bottom: 1rem; }
	.navi-btns { display: flex; gap: .5rem; flex-wrap: wrap; }
	.navi-btn {
		flex: 1; min-width: 80px;
		display: flex; align-items: center; justify-content: center;
		padding: .55rem .5rem;
		border: 1px solid var(--line); border-radius: 8px;
		font-size: 14px; color: #fff; text-decoration: none;
		background: #fff; transition: background .15s;

		&.naver { background-color: #03cd5e; }
		&.tmap  { background-color: #4a4df7; }
		&.kakao { background-color: #f7e111; }
	}
	.navi-btn:hover { background: var(--line); }

	.tp-list { list-style: none; padding: 0; margin-top: 28px; text-align: left; }
	.tp-item { display: flex; gap: 1rem; padding: .9rem 0; border-bottom: 1px solid var(--line); }
	.tp-item:first-child { border-top: 1px solid var(--line); }
	.tp-title { font-size: 14px; font-weight: 500; color: #121212; min-width: 44px; padding-top: 2px; }
	.tp-content p { font-size: 14px; color: var(--sub); line-height: 1.75; margin: 0; }

	/* ── Meal ───────────────────────────────────────────────── */
	.meal-sec { text-align: center; }
	.meal-info { margin-top: 1.6rem; }
	.meal-place { font-size: clamp(15px, 4.2vw, 17px); color: #121212; line-height: 1.7; margin-bottom: 1rem; }
	.meal-desc { font-size: clamp(13px, 3.8vw, 15px); color: var(--sub); line-height: 1.8; }

	/* ── Our Story Timeline (Embla 가로 슬라이더) ───────────── */
	.sec-timeline {
		padding: 60px 0;
	}

	.tl-viewport {
		overflow: hidden;
		height: 542px;
	}
	.tl-container {
		display: flex;
		height: 100%;
		user-select: none;
	}

	/* 커버 슬라이드 */
	.tl-cover {
		flex: 0 0 100%;
		min-width: 0;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 20px;
		padding: 32px 48px 32px 24px;
		background: #fbfbfb;
	}
	.tl-cover-script {
		font-family: 'Playfair Display', serif;
		font-size: clamp(2rem, 12vw, 3rem);
		font-weight: 800;
		color: #1d1d1d;
		letter-spacing: -.03em;
		line-height: 1;
		margin: 0;
		align-self: flex-start;
	}
	.tl-cover-img {
		width: 64%;
		aspect-ratio: 3/4;
		overflow: hidden;
	}
	.tl-cover-img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
	}
	.tl-cover-years {
		display: flex;
		align-items: center;
		gap: 10px;
		align-self: flex-start;
	}
	.tl-year-lbl {
		font-family: TmoneyRoundWind, sans-serif;
		font-size: .72rem;
		letter-spacing: .12em;
		color: var(--muted);
	}
	.tl-year-line {
		width: 44px;
		height: 1px;
		background: var(--muted);
	}
	/* 오른쪽 화살표 — 가로 방향 바운스 */
	.tl-arrow {
		position: absolute;
		right: 14px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
		animation: tl-bounce 1.1s ease-in-out infinite alternate;
	}
	@keyframes tl-bounce {
		from { transform: translateY(-50%) translateX(0); }
		to   { transform: translateY(-50%) translateX(7px); }
	}

	/* 연도 구분 슬라이드 — 좁은 세로 띠 */
	.tl-year-row {
		flex: 0 0 auto;
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 14px;
		background: #f0f3f7;
	}
	.tl-year-badge {
		font-family: 'Playfair Display', serif;
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text);
		writing-mode: vertical-rl;
		letter-spacing: .12em;
		border-left: 2px solid var(--text);
		padding-left: 6px;
	}

	/* 스토리 콘텐츠 슬라이드 */
	.tl-item {
		flex: 0 0 100%;
		min-width: 0;
		overflow-y: hidden;
	}
	.tl-item-img {
		width: 100%;
		aspect-ratio: 4/3;
		overflow: hidden;
	}
	.tl-item-img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform .5s ease;
	}
	.tl-item-img:hover img { transform: scale(1.03); }
	.tl-item-info { padding: 18px 24px 0; }
	.tl-item-title {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 1rem;
		font-weight: 500;
		color: var(--text);
		margin: 0 0 10px;
	}
	.tl-item-desc {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: .82rem;
		line-height: 1.95;
		color: var(--sub);
		margin: 0;
		white-space: pre-line;
	}

	/* ── Gallery ────────────────────────────────────────────── */
	.gall-sec { text-align: center; }
	.gall-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 3px;
		margin-top: 1.6rem;
	}
	.gall-item {
		aspect-ratio: 1 / 1;
		background-size: cover;
		background-position: center;
		cursor: pointer;
		transition: opacity .2s;
		border-radius: .4rem;
		overflow: hidden;
	}
	.gall-item:hover { opacity: .88; }
	.gall-more-wrap { margin-top: 1rem; }
	.gall-more-btn {
		display: inline-flex; align-items: center; gap: 6px;
		padding: .6rem 1.4rem;
		border: 1px solid var(--line); border-radius: 8px;
		background: #fff; color: var(--text);
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 14px; cursor: pointer;
		transition: background .15s;
	}
	.gall-more-btn:hover { background: var(--bg2); }

	/* ── Guestbook ──────────────────────────────────────────── */
	.gb-sec { text-align: center; }
	.gb-container { margin-top: 1.2rem; }
	.gb-note { font-size: clamp(14px, 4vw, 16px); color: var(--sub); line-height: 1.6; margin-bottom: 1.6rem; }
	.gb-tools { display: flex; gap: .6rem; justify-content: center; flex-direction: column; align-items: center; }
	.gb-btn {
		flex: 1; width: 200px; padding: .75rem .5rem;
		border: 1px solid var(--line); border-radius: 10px;
		background: #fff; color: var(--text);
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 14px; cursor: pointer;
		transition: background .15s, border-color .15s;
	}
	.gb-btn:hover { background: var(--bg2); border-color: var(--pink); color: var(--pink); }
	.gb-form { display: flex; flex-direction: column; gap: .55rem; margin-top: 1.4rem; text-align: left; }
	.gb-list { margin-top: 1.4rem; text-align: left; }
	.gb-empty { font-size: 14px; color: var(--muted); text-align: center; padding: 1.5rem 0; }

	/* ── Account ────────────────────────────────────────────── */
	.acc-sec {
		display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		gap: 32px;
		padding: 30px 2rem 80px;
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-weight: 400;
		letter-spacing: -.05rem;
		text-align: center;
	}
	.acc-top { width: 100%; }
	.acc-description {
		font-size: clamp(13px, 3.8vw, 15px); color: var(--sub);
		line-height: 1.8; margin-top: .8rem;
	}
	.acc-body-wrap { width: 100%; }

	/* ── BGM 버튼 ───────────────────────────────────────────── */
	.bgm-btn {
		position: fixed;
		top: 1.2rem; right: 1.2rem;
		z-index: 150;
		width: 40px; height: 40px;
		border-radius: 50%;
		background: rgba(255,255,255,0.85);
		backdrop-filter: blur(6px);
		border: 1px solid rgba(0,0,0,0.08);
		box-shadow: 0 2px 10px rgba(0,0,0,0.12);
		display: flex; align-items: center; justify-content: center;
		cursor: pointer; padding: 0;
		color: var(--text);
		transition: background .2s;
	}
	.bgm-btn:hover { background: rgba(255,255,255,0.98); }
	.bgm-icon { display: block; }

	/* ── Ending ─────────────────────────────────────────────── */
	.ending-area {
		display: flex; flex-direction: column; align-items: center;
		background-color: #ffffff;
	}

	/* 엔딩 사진 */
	.ending-photo {
		aspect-ratio: 393 / 580;
		overflow: hidden;
		position: relative;
		width: 100%;
	}
	.ending-photo img {
		width: 100%; height: 100%;
		object-fit: cover; object-position: center top;
	}

	/* 슬라이드업 오버레이 */
	.ending-text {
		align-items: flex-end;
		background: linear-gradient(to bottom, transparent 0%, #00000099 60%);
		bottom: 0; left: 0; right: 0;
		display: flex;
		height: 300%;
		justify-content: center;
		position: absolute;
		transform: translateY(100%);
		transition: transform 2s cubic-bezier(.4, 0, .2, 1);
		z-index: 2;
	}
	.ending-text.revealed { transform: translateY(0); }

	/* 텍스트 콘텐츠 */
	.ending-text-content {
		align-items: center;
		display: flex; flex-direction: column;
		gap: 12px;
		height: 33.33%;
		justify-content: center;
		opacity: 0;
		transition: opacity .8s ease 1.2s;
	}
	.ending-text-content.visible { opacity: 1; }

	.ending-poem-title {
		font-family: 'Noto Serif KR', serif;
		font-size: 15px; font-weight: 500;
		color: #cccccc; letter-spacing: .08em;
		margin: 0;
	}
	.ending-poem-body {
		font-family: 'Noto Serif KR', serif;
		font-size: 20px; color: #ffffff;
		line-height: 2; text-align: center;
		margin: 0 0 16px;
	}

	.ending-names {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: clamp(17px, 5vw, 20px); font-weight: 500;
		letter-spacing: 0; line-height: 2.5rem;
		color: #ffecec; text-align: center;
	  margin-top: 70px;
	}
	.ending-date {
		font-family: TmoneyRoundWind, 'Noto Serif KR', serif;
		font-size: 14px; letter-spacing: .18em;
		color: #c4c4c4; text-align: center;
	}

	/* 공유 버튼 */
	.share-kakao-wrap {
		position: relative;
		z-index: 10;
		text-align: center;
		padding: 30px 0 10px;
		display: flex;
		align-items: center;
		gap: 30px;
	}

	/* 카피라이트 */
	.ending-copyright {
		font-size: 12px; color: var(--muted);
		text-align: center;
		padding: 6px 0 16px;
		line-height: 1.6;
		letter-spacing: -0.2px;
	}

	/* ── 소형 디바이스 (≤ 370px) 보정 ────────────────────────── */
	.map-box { width: 100%; height: auto; border-radius: 12px; overflow: hidden; border: 1px solid var(--line); }
	.map-render { width: 100%; height: 320px; }

	@media (max-width: 370px) {
		.cover { padding: 28px 18px; }
		.tl-cover { padding: 28px 40px 28px 18px; }
		.tl-item-info { padding: 14px 18px 0; }
		.dday-box { min-width: 0; padding: 10px 16px; }
		.acc-sec { padding: 24px 1.5rem 60px; }
	}
</style>
