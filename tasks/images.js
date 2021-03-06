import gulp from 'gulp';
import path from 'path';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import { reload } from 'browser-sync';
import webp from 'gulp-webp';
import config from './config';

const typeConfig = config.images;

const base = path.join(config.root.src, typeConfig.dist);

const images = () =>
	gulp.
		src(path.join(base, typeConfig.extensions), { base: base }).
		pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })).
		pipe(webp({ quality: 50 })).
		pipe(gulp.dest(path.join(config.root.src, typeConfig.dist))).
		pipe(reload({ stream: true }));

gulp.task('images', images);

export default images;
