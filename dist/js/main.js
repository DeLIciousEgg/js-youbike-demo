; (function () {
  const areaDOM = document.querySelector('.area')
  const borrowDOM = document.querySelector('.chkBorrow')
  const revertDOM = document.querySelector('.chkRevert')
  const stopDOM = document.querySelector('.chkStop')
  const bikeSiteDOM = document.querySelector('.bikeSite')
  const modalDOM = document.querySelector('.mapModal')
  const siteCountDOM = document.querySelector('.siteCount')

  let siteData = []
  let filterArea = []
  let filterBorrow = false
  let filterRevert = false
  let filterStop = false

  function getBikeData () {
    const API =
      'https://script.google.com/macros/s/AKfycbzp8cHN_zwb9Gtc4fKH0B790sdwOnZAOjJZ1etKl7fWNsNBj7hh/exec?url=https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json/preview'
    return new Promise((resolve, reject) => {
      axios(API)
        .then(res => {
          const data = res.data
          if (!data) return false
          // console.log(data)
          resolve(data)
        })
        .catch(e => {
          // console.log(e)
          reject(e)
        })
    })
  }
  function getAreas (data) {
    let area = new Set()
    data.forEach(item => {
      area.add(item.sarea)
    })
    return Array.from(area)
  }
  function setArea (areas) {
    let areaHTML = ``

    areas.forEach((area, index) => {
      areaHTML += `
      <div class="col-6 col-sm-4 col-md-6 text-center p-0 mb-2">
        <div class="custom-control custom-checkbox">
          <input type="checkbox" class="custom-control-input chkArea" data-area="${area}" id="area${index}">
          <label class="custom-control-label text-primary" for="area${index}" >${area}</label>
        </div>
      </div>
      `
    })
    areaDOM.innerHTML = areaHTML

    //全選
    // document.querySelector('.chkAreaAll').addEventListener('change', function (e) {
    //   const isChecked = e.target.checked
    //   const chkArea = document.querySelectorAll('.chkArea')
    //   chkArea.forEach(item => item.checked = isChecked)
    // })
  }
  function setPagination (data) {
    $('#pagination').pagination({
      dataSource: data,
      pageSize: 10,
      showPrevious: false,
      showNext: false,
      className: 'paginationjs-theme-blue paginationjs-big',
      callback: function (data) {
        setSite(data)
        $('html,body').animate({ scrollTop: 0 }, 800)
      }
    })
  }
  function siteDataFilter () {
    let filterData = [...siteData]
    if (filterArea.length > 0)
      filterData = filterData.filter(item => {
        return filterArea.includes(item.sarea)
      })

    if (filterBorrow)
      filterData = filterData.filter(item => {
        return +item.sbi > 0
      })

    if (filterRevert)
      filterData = filterData.filter(item => {
        return +item.bemp > 0
      })

    if (filterStop)
      filterData = filterData.filter(item => {
        return +item.act === 0
      })

    siteCountDOM.innerText = filterData.length
    return filterData
  }
  function setSite (sites) {
    let siteHTML = ''
    sites.forEach(site => {
      siteHTML += `
      <div class="card col-12 col-lg-6 mb-2" data-name="${site.sna}" data-lat="${site.lat}" data-lng="${site.lng}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5><span class="badge badge-danger">${site.sarea}</span></h5>
              <h5 class="card-title h4">${site.sna}</h5>
            </div>
            <i class="fas fa-map-marker-alt text-primary mapIcon"></i>
          </div>
          <p class="font-italic text-primary" style="font-size: 14px; height: 36px;">${site.ar}</p>
          <div class="row">
            <div class="col text-center">
              <h5>
                <span class="d-block">總車位</span>
                <span class="badge badge-primary ml-sm-2 ml-lg-0">${site.tot}</span>
              </h5>
            </div>
            <div class="col text-center">
              <h5>
                <span class="d-block">可租借</span>
                <span class="badge badge-primary ml-sm-2 ml-lg-0">${site.sbi}</span>
              </h5>
            </div>
            <div class="col text-center">
              <h5>
                <span class="d-block">可歸還</span>
                <span class="badge badge-primary ml-sm-2 ml-lg-0">${site.bemp}</span>
              </h5>
            </div>
          </div>
        </div>
      </div>
    `
    })
    bikeSiteDOM.innerHTML = siteHTML
  }
  function initMap (lat, lng) {
    let position = { lat, lng }
    var map = new google.maps.Map(document.getElementById('mapModal__map'), {
      zoom: 18,
      center: position
    });
    var marker = new google.maps.Marker({
      position: position,
      map: map,
      animation: google.maps.Animation.BOUNCE
    });
  }

  areaDOM.addEventListener('click', function (e) {
    const target = e.target
    if (target.className.indexOf('chkArea') < 0) return false
    const datasetArea = target.dataset.area

    if (target.checked) {
      filterArea.push(datasetArea)
    }
    else {
      const areaIndex = filterArea.indexOf(datasetArea)
      if (areaIndex < 0) return false
      filterArea.splice(areaIndex, 1)
    }

    const data = siteDataFilter()
    setPagination(data)
  })
  borrowDOM.addEventListener('change', function () {
    filterBorrow = this.checked
    const data = siteDataFilter()
    setPagination(data)
  })
  revertDOM.addEventListener('change', function () {
    filterRevert = this.checked
    const data = siteDataFilter()
    setPagination(data)
  })
  stopDOM.addEventListener('change', function () {
    filterStop = this.checked
    const data = siteDataFilter()
    setPagination(data)
  })
  bikeSiteDOM.addEventListener('click', function (e) {
    const card = e.target.closest('.card')
    if (!card) return false
    const siteName = card.dataset.name
    const lat = +card.dataset.lat
    const lng = +card.dataset.lng
    document.querySelector('.mapModal__siteName').innerText = siteName
    initMap(lat, lng)
    modalDOM.classList.remove('d-none')
  })
  modalDOM.addEventListener('click', function (e) {
    if (e.target !== modalDOM && e.target.className !== 'mapModal__close') return false
    modalDOM.classList.add('d-none')
  })

  getBikeData()
    .then(res => {
      siteData = res

      const areas = getAreas(res)
      setArea(areas)

      siteCountDOM.innerText = res.length
      setPagination(res)
      document.querySelector('.loading').classList.add('finish')
    })
    .catch(err => {
      console.log('fail', err)
    })

})()
