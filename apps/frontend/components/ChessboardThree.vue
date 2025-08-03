<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const config = useRuntimeConfig();

const props = defineProps(["chessboard", "legalMoves", "lastMove"]);

const lastMove = toRef(props, "lastMove");

const emit = defineEmits(["handleMove"]);

const container = ref(null);

const fov = 75;
const near = 0.01;
const far = 1000;

const squareSize = 0.05;

const whiteColor = 0xffffff;
const blackColor = 0x000000;
const hoverColor = 0xff0000;
const selectColor = 0x0000ff;
const legalColor = 0x00ff00;

const whiteMaterial = ref();
const blackMaterial = ref();
const hoverMaterial = ref();
const selectMaterial = ref();
const legalMaterial = ref();

const scene = new THREE.Scene();
const squareGroup = new THREE.Group();
const pieceGroup = new THREE.Group();
scene.add(squareGroup);
scene.add(pieceGroup);

const camera = ref();
const renderer = ref();
const controls = ref();
const raycaster = ref();
const mouse = ref();
const plane = ref();
const loader = ref();

const hoveredObject = ref(null);
const selectedPiece = ref(null);
const selectedPiecePosition = ref(null);

const init = () => {
    whiteMaterial.value = new THREE.MeshStandardMaterial({ color: whiteColor });
    blackMaterial.value = new THREE.MeshStandardMaterial({ color: blackColor });
    hoverMaterial.value = new THREE.MeshStandardMaterial({ color: hoverColor });
    selectMaterial.value = new THREE.MeshStandardMaterial({ color: selectColor });
    legalMaterial.value = new THREE.MeshStandardMaterial({ color: legalColor });

    camera.value = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
    renderer.value = new THREE.WebGLRenderer({ antialias: false, alpha: true, precision: "lowp" });
    controls.value = new OrbitControls(camera.value, renderer.value.domElement);
    raycaster.value = new THREE.Raycaster();
    mouse.value = new THREE.Vector2();
    plane.value = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    onWindowResize();
    renderer.value.setClearColor(0x000000, 1);
    controls.value.enableDamping = true;
    controls.value.dampingFactor = 0.05;
    controls.value.screenSpacePanning = false;
    controls.value.maxDistance = 1;
    camera.value.position.set(0.3, 0.3, 0.3);
    camera.value.lookAt(0, 0, 0);

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 0.5, 0);
    camera.value.add(light);

    const ambiantLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambiantLight);

    const cameraPole = new THREE.Object3D();
    cameraPole.add(camera.value);
    scene.add(cameraPole);

    container.value.appendChild(renderer.value.domElement);
    window.addEventListener("resize", onWindowResize, false);

    loader.value = new GLTFLoader();
};

const animate = () => {
    requestAnimationFrame(() => {
        animate(scene);
    });
    controls.value.update();
    renderer.value.render(scene, camera.value);
};

const onWindowResize = () => {
    const { width, height } = container.value.getBoundingClientRect();
    camera.value.aspect = width / height;
    camera.value.updateProjectionMatrix();
    renderer.value.setSize(width, height);
};

const addAxis = () => {
    const axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper);
};

const loadChessboard = () => {
    loader.value.load(
        `${config.public.assetsBaseUrl}/models/chess.glb`,
        function (gltf) {
            const chessboard = gltf.scene.children[0];
            chessboard.children.forEach((child, index) => {
                child.position.x -= 0.2;
                child.position.z += 0.2;
                if (index > 1) {
                    const square = child.clone();
                    square.name = child.name.toLowerCase();
                    square.userData.type = "square";
                    square.userData.material = child.material;
                    squareGroup.add(square);
                } else {
                    scene.add(child.clone());
                }
            });

            const pawn = gltf.scene.children[1];
            const rook = gltf.scene.children[2];
            const bishop = gltf.scene.children[3];
            const queen = gltf.scene.children[4];
            const king = gltf.scene.children[5];
            const knight = gltf.scene.children[6];
            whiteMaterial.value = king.material;
            blackMaterial.value = queen.material;

            for (const [rankIndex, rank] of props.chessboard.reversedRanks.entries()) {
                for (const [fileIndex, file] of props.chessboard.files.entries()) {
                    const squareName = file + rank;
                    const square = props.chessboard.squares.get(squareName);
                    const piece = square?.piece;
                    if (piece) {
                        const material = piece.color === "w" ? whiteMaterial.value : blackMaterial.value;
                        const x = squareSize * (fileIndex - props.chessboard.files.length / 2 + 0.5);
                        const z = squareSize * (rankIndex - props.chessboard.ranks.length / 2 + 0.5);

                        let object;
                        switch (piece.getName()) {
                            case "n":
                                object = knight.clone();
                                break;
                            case "b":
                                object = bishop.clone();
                                break;
                            case "r":
                                object = rook.clone();
                                break;
                            case "q":
                                object = queen.clone();
                                break;
                            case "k":
                                object = king.clone();
                                break;
                            default:
                                object = pawn.clone();
                        }
                        object.material = material;
                        object.position.set(x, 0.0001, z);
                        if (piece.color === "b") {
                            object.rotation.y = Math.PI;
                        }
                        object.name = squareName;
                        object.userData.type = "piece";
                        object.userData.material = material;
                        pieceGroup.add(object);
                    }
                }
            }
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );
};

const hasLegalMove = (squareName) => {
    return squareName in props.legalMoves;
};

const isLegalMove = (fromSquareName, toSquareName) => {
    return hasLegalMove(fromSquareName) && toSquareName in props.legalMoves[fromSquareName];
};

const revealLegalSquares = () => {
    if (selectedPiece.value !== null) {
        for (const square of squareGroup.children) {
            if (isLegalMove(selectedPiece.value.name, square.name)) {
                square.material = legalMaterial.value;
            }
        }
    }
};

const removeLegalSquares = () => {
    for (const square of squareGroup.children) {
        square.material = square.userData.material;
    }
};

const moveObject = (object, targetX, targetZ) => {
    object.position.x = targetX;
    object.position.z = targetZ;
};

const carryOutMove = (move) => {
    const fromSquare = squareGroup.getObjectByName(move.fromSquare);
    const fromPiece = pieceGroup.getObjectByName(move.fromSquare);
    const toSquare = squareGroup.getObjectByName(move.toSquare);
    const captureSquare = squareGroup.getObjectByName(move.captureSquare);
    const capturedPiece = pieceGroup.getObjectByName(move.captureSquare);

    if (fromSquare && toSquare && captureSquare && fromPiece) {
        const targetX = toSquare.position.x;
        const targetZ = toSquare.position.z;

        moveObject(fromPiece, targetX, targetZ);

        if (capturedPiece) {
            pieceGroup.remove(capturedPiece);
        }

        fromPiece.name = toSquare.name;
    }
};

watch(lastMove, () => {
    carryOutMove(lastMove.value);
});

const play = (fromSquareName, toSquareName) => {
    emit("handleMove", fromSquareName, toSquareName);
};

const hoverObject = (object) => {
    hoveredObject.value = object;
    object.material = hoverMaterial.value;
};

const removeHoveredObject = () => {
    if (hoveredObject.value !== null) {
        if (
            selectedPiece.value &&
            hoveredObject.value.userData.type === "square" &&
            isLegalMove(selectedPiece.value.name, hoveredObject.value.name)
        ) {
            hoveredObject.value.material = legalMaterial.value;
        } else {
            hoveredObject.value.material = hoveredObject.value.userData.material;
        }
        hoveredObject.value = null;
    }
};

const selectPiece = (piece) => {
    removeHoveredObject();
    selectedPiece.value = piece;
    selectedPiecePosition.value = {
        x: piece.position.x,
        z: piece.position.z,
    };
    piece.material = selectMaterial.value;
};

const unselectPiece = () => {
    if (selectedPiece.value !== null) {
        selectedPiece.value.material = selectedPiece.value.userData.material;
        selectedPiece.value = null;
        selectedPiecePosition.value = null;
    }
};

const dragSelectedPiece = () => {
    if (selectedPiece.value !== null) {
        let point = new THREE.Vector3();
        raycaster.value.ray.intersectPlane(plane.value, point);

        selectedPiece.value.position.x = point.x;
        selectedPiece.value.position.z = point.z;
    }
};

const putBackSelectedPieceToItsPosition = () => {
    moveObject(selectedPiece.value, selectedPiecePosition.value.x, selectedPiecePosition.value.z);
};

const handleMouseMove = (event) => {
    const containerRect = container.value.getBoundingClientRect();
    const offsetX = event.clientX - containerRect.left;
    const offsetY = event.clientY - containerRect.top;

    mouse.value.x = (offsetX / containerRect.width) * 2 - 1;
    mouse.value.y = -(offsetY / containerRect.height) * 2 + 1;

    raycaster.value.setFromCamera(mouse.value, camera.value);

    const objects = squareGroup.children.concat(pieceGroup.children);
    const intersections = raycaster.value.intersectObjects(objects);

    let object = undefined;
    if (intersections.length > 0) {
        object = intersections[0].object;
        if (selectedPiece.value !== null && object.uuid === selectedPiece.value.uuid) {
            object = intersections.length > 1 ? intersections[1].object : undefined;
        }
    }

    removeHoveredObject();
    if (object !== undefined && !(selectedPiece.value !== null && selectedPiece.value.uuid === object.uuid)) {
        hoverObject(object);
    }

    dragSelectedPiece();
};

const handleMouseClick = (event) => {
    const containerRect = container.value.getBoundingClientRect();
    const offsetX = event.clientX - containerRect.left;
    const offsetY = event.clientY - containerRect.top;

    mouse.value.x = (offsetX / containerRect.width) * 2 - 1;
    mouse.value.y = -(offsetY / containerRect.height) * 2 + 1;

    raycaster.value.setFromCamera(mouse.value, camera.value);

    const objects = squareGroup.children.concat(pieceGroup.children);
    const intersections = raycaster.value.intersectObjects(objects);

    let object = undefined;
    if (intersections.length > 0) {
        object = intersections[0].object;
        if (selectedPiece.value !== null && object.uuid === selectedPiece.value.uuid) {
            object = intersections.length > 1 ? intersections[1].object : undefined;
        }
    }

    if (object !== undefined) {
        if (selectedPiece.value !== null) {
            if (object.name !== selectedPiece.value.name) {
                const fromSquareName = selectedPiece.value.name;
                const toSquareName = object.name;
                if (isLegalMove(fromSquareName, toSquareName)) {
                    play(fromSquareName, toSquareName);
                } else {
                    putBackSelectedPieceToItsPosition();
                }
                removeLegalSquares();
                unselectPiece();
            } else {
                removeLegalSquares();
                putBackSelectedPieceToItsPosition();
                unselectPiece();
            }
        } else {
            const piece = object.userData?.type === "piece" ? object : pieceGroup.getObjectByName(object.name);
            if (piece !== undefined) {
                if (hasLegalMove(object.name)) {
                    selectPiece(piece);
                    revealLegalSquares();
                }
            }
        }
    } else {
        if (selectedPiece.value !== null) {
            removeLegalSquares();
            putBackSelectedPieceToItsPosition();
            unselectPiece();
        }
    }
};

onMounted(() => {
    init();
    loadChessboard();
    animate();

    container.value.addEventListener("mousemove", (event) => handleMouseMove(event));
    container.value.addEventListener("click", (event) => handleMouseClick(event));
});
</script>

<template>
    <div ref="container" class="relative size-full overflow-hidden"></div>
</template>
