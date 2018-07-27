(function () {

  window.xs = window.innerWidth <= 1024 ? true : false
  
  window.mobile = window.innerWidth <= 480 ? true : false
  
  window.xsHeight = window.innerHeight <= 540 ? true : false
  
  window.touch = document.querySelector('html').classList.contains('touchevents')
  
	window.animation = {}
	
	window.animation.fadeIn = (elem, ms, cb, d = 'block') => {
    if (!elem)
      return;

    elem.style.opacity = 0;
    elem.style.display = d;

    if (ms) {
      var opacity = 0;
      var timer = setInterval(function () {
        opacity += 50 / ms;
        if (opacity >= 1) {
          clearInterval(timer);
          opacity = 1;
          if (cb) cb()
        }
        elem.style.opacity = opacity;
      }, 50);
    } else {
      elem.style.opacity = 1;
      if (cb) cb()
    }
  }
  
  window.animation.fadeOut = (elem, ms, cb) => {
    if (!elem)
      return;

    elem.style.opacity = 1;

    if (ms) {
      var opacity = 1;
      var timer = setInterval(function () {
        opacity -= 50 / ms;
        if (opacity <= 0) {
          clearInterval(timer);
          opacity = 0;
          elem.style.display = "none";
          if (cb) cb()
        }
        elem.style.opacity = opacity;
      }, 50);
    } else {
      elem.style.opacity = 0;
      elem.style.display = "none";
      if (cb) cb()
    }
  }
  
  window.animation.scrollTo = (to, duration) => {
    if (duration <= 0) return;
    const element = document.documentElement,
          difference = to - element.scrollTop,
          perTick = difference / duration * 10;

    setTimeout(function() {
      element.scrollTop = element.scrollTop + perTick;
      window.animation.scrollTo(to, duration - 10);
    }, 10);
  }
	
  window.animation.visChecker = (el, koef = .35) => {
    let rect = el.getBoundingClientRect()
    return (
      //rect.top >= 0 &&
      //rect.left >= 0 &&
      rect.bottom - el.offsetHeight * koef <= (window.innerHeight || document.documentElement.clientHeight) && 
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) 
    )
  }
  
  window.evraz = {}

  window.evraz.form = ({

    init: function () {

      const _th = this,
            inputs = document.querySelectorAll('.common__input, .common__textarea'),
						forms = document.querySelectorAll('form'),
						selectors = document.querySelectorAll('.js-select'),
            choicesArr = [],
						digitsInput = document.querySelectorAll('.js-digits');

      $('.js-phone').mask('+7(999) 999-9999');

      function emptyCheck(event){
        event.target.value.trim() === '' ? 
          event.target.classList.remove('notempty') :
          event.target.classList.add('notempty')
      }
      
      inputs.forEach( item => {
        item.addEventListener('keyup', emptyCheck)
        item.addEventListener('blur', emptyCheck)
      })
      
      if (document.querySelectorAll('.js-common-file').length) {
        let commonFile = document.querySelectorAll('.js-common-fileinput'),
            commonFileDelete = document.querySelectorAll('.js-common-filedelete')
        
        commonFile.forEach(fileInp => {
          fileInp.addEventListener('change', (e) => {
            let el = fileInp.nextElementSibling,
                path = fileInp.value.split('\\'),
                pathName = path[path.length - 1].split('');
            
            pathName.length >= 20 ? 
              pathName = pathName.slice(0, 18).join('') + '...' :
              pathName = pathName.join('')
            
            el.textContent = pathName;
            el.classList.add('choosed');
          })
        });
        
        commonFileDelete.forEach(fileDelete => {
          fileDelete.addEventListener('click', (e) => {
            let el = fileDelete.previousElementSibling,
                fileInput = fileDelete.previousElementSibling.previousElementSibling;
            el.textContent = el.getAttribute('data-default');
            fileInput.value = '';
            el.classList.remove('choosed');
          })
        });
      }
      
      forms.forEach( form => { 
        form.addEventListener('submit', e => !_th.checkForm(form) && e.preventDefault() && e.stopPropagation())
      })
			
			for (let selector of selectors){ 
        let choice = new Choices(selector, {
          searchEnabled: false,
          itemSelectText: '',
          position: 'bottom'
        });
        choicesArr.push(choice);
      }
			
			for (let digitInput of digitsInput){ 
        digitInput.addEventListener('keydown', (e) => {
          let validArr = [46, 8, 9, 27, 13, 110, 190];
          if (validArr.indexOf(e.keyCode) !== -1 ||
            (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
          }
          if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
          }
        });
      }
    
      return this
    },

    checkForm: function (form) {
      let checkResult = true;
      const warningElems = form.querySelectorAll('.warning');
      
      if (warningElems.length)
        warningElems.forEach( warningElem => 
          warningElem.classList.remove('warning')
        )
      
      form.querySelectorAll('input, textarea, select').forEach((elem) => {
        if (elem.getAttribute('data-req')) {
          switch (elem.getAttribute('data-type')) {
            case 'tel':
              var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
              if (!re.test(elem.value)) {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
            case 'email':
              var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
              if (!re.test(elem.value)) {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
            case 'file':
              if (elem.value.trim() === '') {
                elem.parentNode.classList.add('warning')
                checkResult = false
              }
              break;
            default:
              if (elem.value.trim() === '') {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
          }
        }
      });
      form.querySelectorAll('input[name^=agreement]').forEach((item) => {
				if (!item.checked) {
					item.classList.add('warning')
					checkResult = false
				}
			});
      return checkResult
    }

  }).init()

  window.evraz.obj = ({
    
    specials: () => {
      const specialSwiper = new Swiper ('.js-special', {
        loop: true,
        speed: 1500,
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        navigation: {
          nextEl: '.js-special ~ .swiper-buttons .swiper-button-next',
          prevEl: '.js-special ~ .swiper-buttons .swiper-button-prev',
        }
      })
    },
    
    gallery: () => {
      const galTabs = document.querySelectorAll('.js-gallery-tab'),
            galItems = document.querySelectorAll('.js-gallery-item'),
            headerEl = document.querySelector('.header')
            
      let sidebar
      
      if (document.querySelector('.js-gallery-sticky')) {
        sidebar = new StickySidebar('.js-gallery-sticky',{
          containerSelector: '.gallery',
          innerWrapperSelector: '.gallery__side-sticky',
          topSpacing: 10 + headerEl.offsetHeight,
          bottomSpacing: 0
        });
      }
      
      for (let galItem of galItems) {
        galItem.addEventListener('click', (e) => {
          if (galItem.classList.contains('active')) {
            e.preventDefault()
            return
          }
          
          const tabId = galItem.getAttribute('data-tab'),
                curTab = document.querySelector('.js-gallery-tab.active'),
                newTab = document.querySelector(`.js-gallery-tab[data-tab="${tabId}"]`)
          
          document.querySelector('.js-gallery-item.active').classList.remove('active')
          galItem.classList.add('active')
          
          window.animation.fadeOut(curTab, 200, () => {
            curTab.classList.remove('active')
            window.animation.fadeIn(newTab, 200, () => {
              newTab.classList.add('active')
              sidebar.updateSticky()
            }, 'flex')
          })
          
          e.preventDefault()
        })
      }
      
    },
    
    catalog: () => {
      const catList = document.querySelector('.js-catalog-list'),
            catItems = document.querySelectorAll('.js-catalog-elem')
      
      for (let catItem of catItems) {
        catItem.addEventListener('mouseover', () => {
          const dataImg = catItem.getAttribute('data-img')
          catList.style.backgroundImage = `url(${dataImg})`
        })
      }
      
      catList.addEventListener('mouseout', () => {
        const dataDefault = catList.getAttribute('data-default')
        catList.style.backgroundImage = `url(${dataDefault})`
      })
    },
    
    banner: () => {
      const bannerSwiper = new Swiper ('.js-banner', {
        loop: true,
        speed: 1500,
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        navigation: {
          nextEl: '.js-banner .swiper-button-next',
          prevEl: '.js-banner .swiper-button-prev',
        },
        autoplay: {
          delay: 5000
        },
        on: {
          init: function () {
            const shaveElems = document.querySelectorAll('.js-banner .swiper-slide-duplicate .js-shave')
            
            for (let shaveElem of shaveElems) {
              let shaveHeight = shaveElem.getAttribute('data-height')
              shave(shaveElem, shaveHeight)
            }
          },
        },
        breakpoints: {
          960: {
            autoHeight: true
          }
        }
      })
    },
    
    ourfeat: () => {
      const featElems = document.querySelectorAll('.js-ourfeat-item')
      
      featElems.forEach(item => item.setAttribute('data-top', parseInt(getComputedStyle(item)['top'])))
      
      window.addEventListener('scroll', () => {
        featElems.forEach(item => {
          const rect = item.getBoundingClientRect(),
                diff = rect.bottom - item.offsetHeight - (window.innerHeight || document.documentElement.clientHeight),
                dataKoef = item.getAttribute('data-koef'),
                dataTop = item.getAttribute('data-top')
          
          if (diff <= 0 && (rect.top + item.offsetHeight >= 0)) {
            item.style.top = dataTop - diff * dataKoef + 'px'
          }
        })
      })
    },
    
    clients: () => {
      const bannerSwiper = new Swiper ('.js-clients', {
        loop: false,
        speed: 800,
        slidesPerView: 6,
        spaceBetween: 0,
        navigation: {
          nextEl: '.js-clients ~ .swiper-buttons .swiper-button-next',
          prevEl: '.js-clients ~ .swiper-buttons .swiper-button-prev',
        },
        breakpoints: {
          1200: {
            slidesPerView: 4
          },
          900: {
            slidesPerView: 2
          }
        }
      })
    },
    
    init: function () {

      const burgerEl = document.querySelector('.js-burger'),
            html = document.querySelector('html'),
            elemsToCheck = ['.news__grid_page .news__elem-imgover', '.js-scroll-imgover', '.about__steps-elem'],
            shaveElems = document.querySelectorAll('.js-shave'),
            headerEl = document.querySelector('.header'),
            headerMenuEls = document.querySelectorAll('.js-header-to')
      
      /*burgerEl.addEventListener('click', (e) => {
        html.classList.toggle('burgeropen')
        if (burgerEl.classList.contains('open')) {
          burgerEl.classList.add('remove')
          setTimeout(() => {
            burgerEl.classList.remove('open', 'remove')
          }, 1000)
        } else {
          burgerEl.classList.add('open')
        }
        e.preventDefault()
      })*/
      
      if (document.querySelector('.js-banner')) this.banner()
      
      if (document.querySelector('.js-special')) this.specials()
      
      if (document.querySelector('.js-catalog-elem')) this.catalog()
      
      if (document.querySelector('.js-gallery-item')) this.gallery()
      
      if (document.querySelector('.js-ourfeat-item')) this.ourfeat()
      
      if (document.querySelector('.js-clients')) this.clients()
      
      for (let headerMenuEl of headerMenuEls) {
        headerMenuEl.addEventListener('click', (e) => {
          const dataTo = headerMenuEl.getAttribute('data-to')
          window.animation.scrollTo(document.querySelector(`.${dataTo}`).offsetTop - headerEl.offsetHeight - 40, 1000)
          e.preventDefault()
        })
      }
      
      window.addEventListener('resize', () => {
        window.xs = window.innerWidth <= 960 ? true : false
        window.mobile = window.innerWidth <= 480 ? true : false
        window.xsHeight = window.innerHeight <= 540 ? true : false
      })
      
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          headerEl.classList.add('fixed_ready')
        } else {
          headerEl.classList.remove('fixed_ready')
        }
        if (window.pageYOffset > 500) {
          headerEl.classList.add('fixed')
        } else {
          headerEl.classList.remove('fixed')
        }
        
        elemsToCheck.forEach(item => {
          document.querySelectorAll(item).forEach(elem => {
            if (window.animation.visChecker(elem)) {
              elem.classList.add('visible')
            }
          })
        })
      })
      
      for (let shaveElem of shaveElems) {
        let shaveHeight = shaveElem.getAttribute('data-height')
        shave(shaveElem, shaveHeight)
      }
			
      $('.js-catalog-elem').fancybox({
        touch: false,
        i18n: {
          en: {
            CLOSE: "Закрыть"
          }
        },
        afterShow: function( instance, current ) {
          const car = instance.current.$content[0].querySelector('.js-card-imgs'),
                scrollable = instance.current.$content[0].querySelector('.js-scrollable'),
                btnPrev = instance.current.$content[0].querySelector('.swiper-button-prev'),
                btnNext = instance.current.$content[0].querySelector('.swiper-button-next')

          new PerfectScrollbar(scrollable, {
            wheelPropagation: true,
            suppressScrollX: false
          })
          
          new Swiper (car, {
            loop: false,
            speed: 800,
            slidesPerView: 1,
            spaceBetween: 0,
            autoHeight: true,
            navigation: {
              nextEl: btnNext,
              prevEl: btnPrev,
            }
          })
        }
      })
      
      $('[data-fancybox]:not(.js-catalog-elem)').fancybox({
        i18n: {
          en: {
            CLOSE: "Закрыть"
          }
        }
      })

      let eventScroll = new Event('scroll')
      window.dispatchEvent(eventScroll)
      
      return this
    }
  }).init()

})();
