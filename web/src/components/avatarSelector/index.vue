<template>
	<div class="user-info-head" @click="editCropper()">
		<el-avatar :size="100" :src="options.img" />
		<el-dialog :title="title" v-model="dialogVisiable" width="600px" append-to-body @opened="modalOpened" @close="closeDialog">
			<el-row>
				<el-col class="flex justify-center">
					<vue-cropper
						ref="cropper"
						:img="options.img"
						:info="true"
						:autoCrop="options.autoCrop"
						:autoCropWidth="options.autoCropWidth"
						:autoCropHeight="options.autoCropHeight"
						:fixedBox="options.fixedBox"
						:outputType="options.outputType"
						@realTime="realTime"
						:centerBox="true"
						v-if="visible"
						class="cropper"
					/>
				</el-col>
			</el-row>
			<br />
			<el-row class="flex justify-center">
				<el-col :lg="2" :md="2">
					<el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
						<el-button type="success">
							choose
							<el-icon class="el-icon--right"><Plus /></el-icon>
						</el-button>
					</el-upload>
				</el-col>
				<el-col :lg="{ span: 1, offset: 2 }" :md="2">
					<el-button icon="RefreshLeft" @click="rotateLeft()"></el-button>
				</el-col>
				<el-col :lg="{ span: 1, offset: 2 }" :md="2">
					<el-button icon="RefreshRight" @click="rotateRight()"></el-button>
				</el-col>
				<el-col :lg="{ span: 2, offset: 2 }" :md="2">
					<el-button type="primary" @click="uploadImg()">Update avatar</el-button>
				</el-col>
			</el-row>
		</el-dialog>
	</div>
</template>

<script setup>
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import { useUserInfo } from '/@/stores/userInfo';
import { getCurrentInstance, nextTick, reactive, ref, computed, onMounted, defineExpose } from 'vue';
import { base64ToFile } from '/@/utils/tools';
const userStore = useUserInfo();
const { proxy } = getCurrentInstance();

const open = ref(false);
const visible = ref(false);
const title = ref('Modify avatar');
const emit = defineEmits(['uploadImg']);
const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
		required: true,
	},
});
const dialogVisiable = computed({
	get() {
		return props.modelValue;
	},
	set(newVal) {
		emit('update:modelValue', newVal);
	},
});

//Image cropping data
const options = reactive({
	img: userStore.userInfos.avatar, // Address of cropped image
	fileName: '',
	autoCrop: true, // Whether to generate screenshot boxes by default
	autoCropWidth: 200, // The default generated screenshot frame width
	autoCropHeight: 200, // The default generated screenshot frame height
	fixedBox: true, // Fixed screenshot frame size No change allowed
	outputType: 'png', // The default screenshot is generated asPNGFormat
});

/** Edit avatar */
function editCropper() {
	dialogVisiable.value = true;
}
/** Open the callback at the end of the pop-up layer */
function modalOpened() {
	nextTick(() => {
		visible.value = true;
	});
}
/** Override the default upload behavior */
function requestUpload() {}
/** Rotate left */
function rotateLeft() {
	proxy.$refs.cropper.rotateLeft();
}
/** Rotate to the right */
function rotateRight() {
	proxy.$refs.cropper.rotateRight();
}
/** Image zoom */
function changeScale(num) {
	num = num || 1;
	proxy.$refs.cropper.changeScale(num);
}
/** Upload preprocessing */
function beforeUpload(file) {
	if (file.type.indexOf('image/') == -1) {
		proxy.$modal.msgError('File format error，Please upload image type,like：JPG，PNGFile with suffix。');
	} else {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			options.img = reader.result;
			options.fileName = file.name;
		};
	}
}
/** Upload pictures */
function uploadImg() {
	// Get screenshots base64 data
	proxy.$refs.cropper.getCropData((data) => {
		let img = new Image();
		img.src = data;
		img.onload = async () => {
			let _data = compress(img);
			const imgFile = base64ToFile(_data, options.fileName);
			emit('uploadImg', imgFile);
		};
	});
}
// Compressed pictures
function compress(img) {
	let canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');
	// let initSize = img.src.length;
	let width = img.width;
	let height = img.height;
	canvas.width = width;
	canvas.height = height;
	// Lay the base color
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, 0, 0, width, height);
	// Perform compression
	let ndata = canvas.toDataURL('image/jpeg', 0.8);
	return ndata;
}

/** Close the window */
function closeDialog() {
	options.visible = false;
	options.img = userStore.userInfos.avatar;
}

const updateAvatar = (img) => {
	options.img = img;
};

defineExpose({
	updateAvatar,
});
</script>

<style lang="scss" scoped>
.user-info-head {
	position: relative;
	display: inline-block;
	height: 120px;
}

.user-info-head:hover:after {
	content: 'Modify avatar';
	position: absolute;
	text-align: center;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	color: #000000;
	font-size: 20px;
	font-style: normal;
	cursor: pointer;
	line-height: 110px;
}
.cropper {
	height: 400px;
	width: 400px;
}
</style>
