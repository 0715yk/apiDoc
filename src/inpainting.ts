import { fabric } from "fabric";

// "test": "echo \"Error: no test specified\" && exit 1",
// "dev": "vite",

const inpainter = (function () {
  let canvas = null as null | fabric.Canvas;
  let selectedObject = null as null | fabric.Image;
  return {
    /**
     * fabric의 base가 되는 canvas를 생성 및 리턴합니다. 개발자가 작업을 할 때에 이 baseCanvas 리턴값을 가지고 해야할 작업은 특별히 없습니다.
     * 만약 null 이 나왔을 경우(모듈 자체에 에러가 있는 경우) 분기처리를 하여 에러 처리를 하기 위한 용도로 리턴값을 만들어놨습니다.
     *
     * @alpha
     * @param canvasId - 생성해놓은 canvas tag의 id 값을 넣어줍니다.
     * @returns 정상적으로 canvas가 생성됐다면 fabric.Canvas 객체가 리턴되고, 아닌 경우 null이 리턴됩니다.
     *
     * @example
     * ```typescript
      import inpainter from "fabric-image-maker";

      const baseFabricCanvas = inpainter.createBaseCanvas("canvas-id");
     * ```
     */
    createBaseCanvas(canvasId: string) {
      try {
        canvas = new fabric.Canvas(canvasId, {
          backgroundColor: "green",
          preserveObjectStacking: true,
        });

        return canvas;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    /**
     * UI/UX 적으로 다양한 방법으로 이미지 input을 받고, 받은 이미지의 src 정보를 바탕으로(data url) 'createBaseCanvas'과 연결된 base canvas에 이미지 레이어를 추가해주는 메서드 입니다.
     * 드롭 다운, 업로드 버튼 등 다양한 UX로 구현한 이미지 업로드 기능에서 추출한 img src 정보를 parameter에 넣어주고 이 메서드를 실행하면 이미지 레이어가 추가됩니다.
     * 이미지는 base canvas의 왼쪽 상단 꼭지점을 (0,0)으로 하여 생성됩니다(top, left: 0)
     *
     * @alpha
     * @param src - 이미지의 url src 정보를 string 타입으로 넣어줍니다.
     * @returns
     *
     * @example
     * ```typescript
    import inpainter from "fabric-image-maker";

    buttonElement.addEventListener("click", function () {
        if (imageInputElement.files !== null) {
            const file = imageInputElement.files[0];
            const reader = new FileReader();
            const img = new Image() as HTMLImageElement;

            reader.readAsDataURL(file);
            reader.onload = (e) => {
                if (img !== null && e?.target !== null) {
                    inpainter.addImageLayer(e.target.result as string);
                }
            };
        }
    });
     * ```
     */
    addImageLayer(src: string) {
      (function () {
        fabric.Image.fromURL(src, function (oImg: fabric.Image) {
          if (canvas !== null) {
            oImg.set("left", 0).set("top", 0);
            oImg.on("selected", function () {
              selectedObject = oImg;
            });
            canvas.add(oImg);
          }
        });
      })();
    },
    /**
     * 특정 레이어에 있는 이미지를 클릭한 상태로 해당 메서드를 호출하면 레이어가 한레벨 올라가게 됩니다(간단히 말해 한단계 앞으로 이동합니다).
     * 개발시에 '한레벨 위로' 혹은 '한단계 앞으로' 등의 버튼을 만들고, 클릭시에 이 메서드를 호출해주면 됩니다(UX는 자율적으로 하시면 됩니다).
     *
     * @alpha
     * @param 
     * @returns
     *
     * @example
     * ```typescript
    import inpainter from "fabric-image-maker";

    const bringForwardBtnElement = document.querySelector(
        "#bringForwardBtn"
    ) as HTMLButtonElement;

    bringForwardBtnElement.addEventListener("click", function () {
        inpainter.bringForward();
    });
     * ```
     */
    bringForward() {
      if (selectedObject !== null && canvas !== null) {
        canvas.bringForward(selectedObject);
      }
    },
    /**
     * 특정 레이어에 있는 이미지를 클릭한 상태로 해당 메서드를 호출하면 레이어가 최상위 레벨로 올라가게 됩니다(간단히 말해 맨앞으로 이동합니다).
     * 개발시에 '최상위 레벨로' 혹은 '맨앞으로' 등의 버튼을 만들고, 클릭시에 이 메서드를 호출해주면 됩니다(UX는 자율적으로 하시면 됩니다).
     *
     * @alpha
     * @param 
     * @returns
     *
     * @example
     * ```typescript
    import inpainter from "fabric-image-maker";
        
    const bringToFrontBtnElement = document.querySelector(
        "#bringToFrontBtn"
    ) as HTMLButtonElement;

    bringToFrontBtnElement.addEventListener("click", function () {
        inpainter.bringToFront();
    });
     * ```
     */
    bringToFront() {
      if (selectedObject !== null && canvas !== null) {
        canvas.bringToFront(selectedObject);
      }
    },
    /**
     * 현재 base canvas를 화면에 img tag로 시각화하고자 할 때 img src 에 사용할 수 있는 src url를 리턴해주는 메서드입니다.
     *
     * @alpha
     * @param 
     * @returns - createCanvas를 하지 않았다면 ""를 리턴합니다. 
     *
     * @example
     * ```typescript
    import inpainter from "fabric-image-maker";

    getImageBtnElement.addEventListener("click", function () {
        const mergedImageElement = document.querySelector(
        "#merged_image"
        ) as HTMLImageElement;
        const url = inpainter.canvasToDataUrl();
        mergedImageElement.src = url;
    });
     * ```
     */
    canvasToDataUrl() {
      if (canvas !== null) {
        const pngURL = canvas.toDataURL();
        return pngURL;
      } else {
        return "";
      }
    },
    /**
     * blob type 데이터 추출을 위해 dataURI를 blob으로 컨버팅 해주는 메서드입니다. 모듈에서 굳이 가져와서 쓸일이 없을 것 같습니다(모듈 내에서 사용하고 있습니다).
     *
     * @alpha
     * @param
     * @returns - image blob 타입 데이터를 리턴합니다.
     *
     **/
    dataURItoBlob(dataURI: string) {
      const byteString = window.atob(dataURI.split(",")[1]);
      const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });
      return blob;
    },
    /**
     * 현재 base canvas(image를 포함한) 서버에 보내기 전에 blob 형태로 추출하는 메서드입니다.
     * @alpha
     * @param 
     * @returns - 메서드가 정상적으로 동작하지 않았다면 null을 리턴합니다. 
     *
     * @example
     * ```typescript
    import inpainter from "fabric-image-maker";

    const getBlobBtnElement = document.querySelector("#getBlobBtn") as HTMLButtonElement;

    getBlobBtnElement.addEventListener("click", function () {
        const blob = inpainter.imageCanvasToBlob();
        const formData = new FormData();
        formData.append("file", blob);

        const request = new XMLHttpRequest();
        request.onload = completeRequest;
        request.open("POST", "IdentifyFood");
        request.send(formData);
    });
     * ```
     */
    imageCanvasToBlob() {
      const dataURI = this.canvasToDataUrl();
      if (dataURI === "") {
        return null;
      } else {
        const blob = this.dataURItoBlob(dataURI);
        return blob;
      }
    },
  };
})();

export default inpainter;

// 1) stage를 만든다.
// 2) 이미지를 업로드하면 새로운 레이어를 만든다.
// 3) 이미지를 업로드하면 새로운 레이어를 만든다,,, X N번
// 4) 최상단에는 마스킹 용 레이어가 있다(default)
// 5) 이 뒤에 canvas 크기는 고정인지 아니면 상대적으로 더큰 이미지가 기준이 되는지?

// 추가할 기능
// - canvas를 blob으로 바꿔서 리턴하기
// - 마스킹 canvas 레이어 만들기
// - 브러쉬 선택 기능(크기)
// - 브러쉬 선택 기능(색상)
// - 지우개 선택 기능(크기 조절)
// - 마스킹 canvas를 blob으로 바꿔서 리턴하기

// - testing code 작성 및 최종 테스트
// - 모든 메서드에는 return 값이 임의로라도 있어야한다(비동기 처리인 것 같아서 여기에 대한 고려도 필요) - error 처리

// 궁금한점
